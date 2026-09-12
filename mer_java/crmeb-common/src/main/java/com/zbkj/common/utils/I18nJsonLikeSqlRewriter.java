package com.zbkj.common.utils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 把已登记表上的 {@code col LIKE expr} 改写成 {@code (col LIKE expr OR col_json LIKE expr)}。
 */
public final class I18nJsonLikeSqlRewriter {

    private static final Pattern FROM_JOIN = Pattern.compile(
            "(?i)\\b(?:from|join)\\s+(`?[a-zA-Z][\\w]*`?)(?:\\s+(?:as\\s+)?(`?[a-zA-Z][\\w]*`?))?");
    private static final Set<String> NOT_ALIAS = new HashSet<String>();

    static {
        Collections.addAll(NOT_ALIAS,
                "on", "where", "left", "right", "inner", "outer", "join", "cross", "straight_join",
                "set", "order", "group", "limit", "having", "union", "into", "select", "force",
                "use", "ignore", "partition", "as", "and", "or", "using");
    }

    private I18nJsonLikeSqlRewriter() {
    }

    public static final class Result {
        public final String sql;
        /** 原始 ParameterMapping 下标区间 [from, from+len)，需在区间后复制一份 */
        public final List<int[]> duplicates;

        Result(String sql, List<int[]> duplicates) {
            this.sql = sql;
            this.duplicates = duplicates;
        }
    }

    public static Result rewrite(String sql) {
        if (sql == null || indexOfWord(sql, "like", 0) < 0) {
            return null;
        }
        Map<String, String> aliasToTable = parseAlias(sql);
        String mainTable = parseMainTable(sql);
        List<Replacement> replacements = new ArrayList<Replacement>();
        int searchFrom = 0;
        while (true) {
            int likeAt = indexOfWord(sql, "like", searchFrom);
            if (likeAt < 0) {
                break;
            }
            searchFrom = likeAt + 4;
            if (precededByNot(sql, likeAt)) {
                continue;
            }
            ColumnRef column = readColumnBefore(sql, likeAt);
            if (column == null) {
                continue;
            }
            String table = resolveTable(column.alias, aliasToTable, mainTable);
            String jsonCol = I18nJsonColumnRegistry.jsonColumn(table, column.column);
            if (jsonCol == null) {
                continue;
            }
            int exprStart = skipWs(sql, likeAt + 4);
            int exprEnd = parseLikeExprEnd(sql, exprStart);
            if (exprEnd < 0) {
                continue;
            }
            String jsonQualified = column.alias == null ? jsonCol : (column.rawAlias + "." + jsonCol);
            if (alreadyHasJsonOr(sql, exprEnd, jsonQualified)) {
                continue;
            }
            String likeExpr = sql.substring(exprStart, exprEnd);
            String original = sql.substring(column.start, exprEnd);
            String wrapped = "(" + original + " or " + jsonQualified + " like " + likeExpr + ")";
            int qFrom = countQuestion(sql, 0, exprStart);
            int qLen = countQuestion(sql, exprStart, exprEnd);
            replacements.add(new Replacement(column.start, exprEnd, wrapped, qFrom, qLen));
        }
        if (replacements.isEmpty()) {
            return null;
        }
        StringBuilder out = new StringBuilder(sql);
        List<int[]> duplicates = new ArrayList<int[]>();
        for (int i = replacements.size() - 1; i >= 0; i--) {
            Replacement r = replacements.get(i);
            out.replace(r.start, r.end, r.text);
            if (r.mappingLen > 0) {
                duplicates.add(new int[]{r.mappingFrom, r.mappingLen});
            }
        }
        Collections.reverse(duplicates);
        return new Result(out.toString(), duplicates);
    }

    static Map<String, String> parseAlias(String sql) {
        Map<String, String> map = new HashMap<String, String>();
        Matcher matcher = FROM_JOIN.matcher(sql);
        while (matcher.find()) {
            String table = I18nJsonColumnRegistry.norm(matcher.group(1));
            if (!table.startsWith("eb_")) {
                continue;
            }
            String aliasRaw = matcher.group(2);
            if (aliasRaw == null) {
                continue;
            }
            String alias = I18nJsonColumnRegistry.norm(aliasRaw);
            if (NOT_ALIAS.contains(alias)) {
                continue;
            }
            map.put(alias, table);
        }
        return map;
    }

    static String parseMainTable(String sql) {
        Matcher matcher = Pattern.compile("(?i)\\bfrom\\s+(`?eb_[a-zA-Z0-9_]+`?)").matcher(sql);
        if (matcher.find()) {
            return I18nJsonColumnRegistry.norm(matcher.group(1));
        }
        return null;
    }

    private static String resolveTable(String alias, Map<String, String> aliasToTable, String mainTable) {
        if (alias != null) {
            String table = aliasToTable.get(I18nJsonColumnRegistry.norm(alias));
            if (table != null) {
                return table;
            }
            String asTable = I18nJsonColumnRegistry.norm(alias);
            if (I18nJsonColumnRegistry.hasTable(asTable)) {
                return asTable;
            }
            return null;
        }
        return mainTable;
    }

    private static ColumnRef readColumnBefore(String sql, int likeAt) {
        int end = likeAt;
        int i = end - 1;
        while (i >= 0 && Character.isWhitespace(sql.charAt(i))) {
            i--;
        }
        if (i < 0) {
            return null;
        }
        int colEnd = i + 1;
        int colStart = readIdentStart(sql, i);
        if (colStart < 0) {
            return null;
        }
        String column = stripIdent(sql.substring(colStart, colEnd));
        i = colStart - 1;
        while (i >= 0 && Character.isWhitespace(sql.charAt(i))) {
            i--;
        }
        if (i >= 0 && sql.charAt(i) == '.') {
            int dot = i;
            i = dot - 1;
            while (i >= 0 && Character.isWhitespace(sql.charAt(i))) {
                i--;
            }
            int aliasStart = readIdentStart(sql, i);
            if (aliasStart < 0) {
                return null;
            }
            String rawAlias = sql.substring(aliasStart, i + 1).trim();
            return new ColumnRef(aliasStart, stripIdent(rawAlias), rawAlias.replace("`", ""), column);
        }
        return new ColumnRef(colStart, null, null, column);
    }

    private static int readIdentStart(String sql, int lastCharIdx) {
        if (lastCharIdx < 0) {
            return -1;
        }
        if (sql.charAt(lastCharIdx) == '`') {
            int start = lastCharIdx - 1;
            while (start >= 0 && sql.charAt(start) != '`') {
                start--;
            }
            return start >= 0 ? start : -1;
        }
        int start = lastCharIdx;
        while (start >= 0) {
            char c = sql.charAt(start);
            if (Character.isLetterOrDigit(c) || c == '_') {
                start--;
            } else {
                break;
            }
        }
        int identStart = start + 1;
        if (identStart > lastCharIdx) {
            return -1;
        }
        char first = sql.charAt(identStart);
        if (!Character.isLetter(first) && first != '_') {
            return -1;
        }
        return identStart;
    }

    private static String stripIdent(String ident) {
        return I18nJsonColumnRegistry.norm(ident);
    }

    private static int parseLikeExprEnd(String sql, int start) {
        if (start >= sql.length()) {
            return -1;
        }
        if (sql.charAt(start) == '?') {
            return start + 1;
        }
        if (startsIgnoreCase(sql, start, "concat")) {
            int paren = skipWs(sql, start + 6);
            if (paren >= sql.length() || sql.charAt(paren) != '(') {
                return -1;
            }
            return matchParen(sql, paren) + 1;
        }
        if (sql.charAt(start) == '\'') {
            return matchQuote(sql, start) + 1;
        }
        if (sql.charAt(start) == '#' && start + 1 < sql.length() && sql.charAt(start + 1) == '{') {
            int end = sql.indexOf('}', start + 2);
            return end < 0 ? -1 : end + 1;
        }
        return -1;
    }

    private static boolean alreadyHasJsonOr(String sql, int exprEnd, String jsonQualified) {
        int i = skipWs(sql, exprEnd);
        if (!startsIgnoreCase(sql, i, "or")) {
            return false;
        }
        i = skipWs(sql, i + 2);
        return startsIgnoreCase(sql, i, jsonQualified) && nextIsLike(sql, i + jsonQualified.length());
    }

    private static boolean nextIsLike(String sql, int from) {
        int i = skipWs(sql, from);
        return startsIgnoreCase(sql, i, "like") && (i + 4 >= sql.length() || !isIdentChar(sql.charAt(i + 4)));
    }

    private static int matchParen(String sql, int open) {
        int depth = 0;
        for (int i = open; i < sql.length(); i++) {
            char c = sql.charAt(i);
            if (c == '\'') {
                i = matchQuote(sql, i);
                continue;
            }
            if (c == '(') {
                depth++;
            } else if (c == ')') {
                depth--;
                if (depth == 0) {
                    return i;
                }
            }
        }
        return -1;
    }

    private static int matchQuote(String sql, int open) {
        for (int i = open + 1; i < sql.length(); i++) {
            char c = sql.charAt(i);
            if (c == '\\') {
                i++;
                continue;
            }
            if (c == '\'') {
                if (i + 1 < sql.length() && sql.charAt(i + 1) == '\'') {
                    i++;
                    continue;
                }
                return i;
            }
        }
        return sql.length() - 1;
    }

    private static boolean precededByNot(String sql, int likeAt) {
        int i = likeAt - 1;
        while (i >= 0 && Character.isWhitespace(sql.charAt(i))) {
            i--;
        }
        return i >= 2 && startsIgnoreCase(sql, i - 2, "not") && (i - 2 == 0 || !isIdentChar(sql.charAt(i - 3)));
    }

    static int indexOfWord(String sql, String word, int from) {
        int len = word.length();
        for (int i = from; i + len <= sql.length(); i++) {
            if (!startsIgnoreCase(sql, i, word)) {
                continue;
            }
            if (i > 0 && isIdentChar(sql.charAt(i - 1))) {
                continue;
            }
            if (i + len < sql.length() && isIdentChar(sql.charAt(i + len))) {
                continue;
            }
            return i;
        }
        return -1;
    }

    private static boolean startsIgnoreCase(String sql, int offset, String token) {
        if (offset < 0 || offset + token.length() > sql.length()) {
            return false;
        }
        return sql.regionMatches(true, offset, token, 0, token.length());
    }

    private static boolean isIdentChar(char c) {
        return Character.isLetterOrDigit(c) || c == '_';
    }

    private static int skipWs(String sql, int i) {
        while (i < sql.length() && Character.isWhitespace(sql.charAt(i))) {
            i++;
        }
        return i;
    }

    private static int countQuestion(String sql, int from, int to) {
        int n = 0;
        for (int i = from; i < to && i < sql.length(); i++) {
            if (sql.charAt(i) == '?') {
                n++;
            }
        }
        return n;
    }

    private static final class ColumnRef {
        final int start;
        final String alias;
        final String rawAlias;
        final String column;

        ColumnRef(int start, String alias, String rawAlias, String column) {
            this.start = start;
            this.alias = alias;
            this.rawAlias = rawAlias;
            this.column = column;
        }
    }

    private static final class Replacement {
        final int start;
        final int end;
        final String text;
        final int mappingFrom;
        final int mappingLen;

        Replacement(int start, int end, String text, int mappingFrom, int mappingLen) {
            this.start = start;
            this.end = end;
            this.text = text;
            this.mappingFrom = mappingFrom;
            this.mappingLen = mappingLen;
        }
    }
}

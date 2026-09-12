package com.zbkj.common.interceptor;

import com.zbkj.common.utils.I18nJsonLikeSqlRewriter;
import org.apache.ibatis.executor.statement.StatementHandler;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.ParameterMapping;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Plugin;
import org.apache.ibatis.plugin.Signature;
import org.apache.ibatis.reflection.MetaObject;
import org.apache.ibatis.reflection.SystemMetaObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 已登记多语言表上的 LIKE 自动 OR JSON 列，后续新增模块只要登记即可。
 */
@Intercepts({
        @Signature(type = StatementHandler.class, method = "prepare", args = {Connection.class, Integer.class})
})
public class I18nJsonLikeInterceptor implements Interceptor {

    private static final Logger LOGGER = LoggerFactory.getLogger(I18nJsonLikeInterceptor.class);

    private static final String SESSION_SQL_MODE =
            "SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'";

    private static final Set<Integer> SQL_MODE_APPLIED = ConcurrentHashMap.newKeySet();

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        applySessionSqlMode((Connection) invocation.getArgs()[0]);
        StatementHandler statementHandler = (StatementHandler) invocation.getTarget();
        BoundSql boundSql = statementHandler.getBoundSql();
        if (boundSql == null || boundSql.getSql() == null) {
            return invocation.proceed();
        }
        I18nJsonLikeSqlRewriter.Result result = I18nJsonLikeSqlRewriter.rewrite(boundSql.getSql());
        if (result == null) {
            return invocation.proceed();
        }
        MetaObject metaObject = SystemMetaObject.forObject(boundSql);
        metaObject.setValue("sql", result.sql);
        if (!result.duplicates.isEmpty()) {
            duplicateMappings(boundSql, metaObject, result.duplicates);
        }
        return invocation.proceed();
    }

    private void applySessionSqlMode(Connection connection) {
        if (connection == null) {
            return;
        }
        int key = System.identityHashCode(connection);
        if (!SQL_MODE_APPLIED.add(key)) {
            return;
        }
        try (Statement statement = connection.createStatement()) {
            statement.execute(SESSION_SQL_MODE);
        } catch (Exception e) {
            SQL_MODE_APPLIED.remove(key);
            LOGGER.warn("无法去掉 ONLY_FULL_GROUP_BY: {}", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void duplicateMappings(BoundSql boundSql, MetaObject metaObject, List<int[]> duplicates) {
        List<ParameterMapping> mappings = boundSql.getParameterMappings();
        if (mappings == null || mappings.isEmpty()) {
            return;
        }
        List<ParameterMapping> list;
        if (mappings instanceof ArrayList) {
            list = mappings;
        } else {
            list = new ArrayList<ParameterMapping>(mappings);
            try {
                metaObject.setValue("parameterMappings", list);
            } catch (Exception e) {
                LOGGER.warn("无法替换 BoundSql.parameterMappings，跳过多语言 LIKE 参数复制", e);
                return;
            }
        }
        for (int i = duplicates.size() - 1; i >= 0; i--) {
            int from = duplicates.get(i)[0];
            int len = duplicates.get(i)[1];
            if (from < 0 || len <= 0 || from + len > list.size()) {
                continue;
            }
            for (int k = len - 1; k >= 0; k--) {
                list.add(from + len, list.get(from + k));
            }
        }
    }

    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(Properties properties) {
    }
}

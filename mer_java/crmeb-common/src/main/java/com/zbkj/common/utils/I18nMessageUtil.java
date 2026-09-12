package com.zbkj.common.utils;

import cn.hutool.core.io.IoUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 按请求头 lang 翻译接口提示语。Controller 可继续写中文，返回时统一转换。
 */
public class I18nMessageUtil {

    private static final Logger LOGGER = LoggerFactory.getLogger(I18nMessageUtil.class);
    private static final Pattern CJK = Pattern.compile("[\\u4e00-\\u9fff]");
    private static final Map<String, Map<String, String>> DICT = new LinkedHashMap<>();
    private static final Map<String, List<Tpl>> TEMPLATES = new LinkedHashMap<>();

    private static final String[][] TOASTS = {
            {"请求成功", "Success", "สำเร็จ", "အောင်မြင်ပါသည်"},
            {"参数检验失败", "Validation failed", "ตรวจสอบพารามิเตอร์ไม่ผ่าน", "ကန့်သတ်ချက် စစ်ဆေးမှု မအောင်မြင်ပါ"},
            {"未登录，请登录！", "Please sign in", "กรุณาเข้าสู่ระบบ", "ကျေးဇူးပြု၍ ဝင်ရောက်ပါ"},
            {"token过期，请登录！", "Login expired. Please sign in again.", "โทเค็นหมดอายุ กรุณาเข้าสู่ระบบ", "token သက်တမ်းကုန်ပါပြီ။ ပြန်ဝင်ပါ"},
            {"无访问权限,请联系管理员授予权限", "No permission. Please contact the administrator", "ไม่มีสิทธิ์ กรุณาติดต่อผู้ดูแลระบบ", "ခွင့်ပြုချက် မရှိပါ။ စီမံခန့်ခွဲသူကို ဆက်သွယ်ပါ"},
            {"资源未找到", "Resource not found", "ไม่พบทรัพยากร", "အရင်းအမြစ် မတွေ့ပါ"},
            {"系统异常，请稍后重试", "System error, please try again later", "ระบบผิดพลาด กรุณาลองใหม่ภายหลัง", "စနစ်အမှား၊ နောက်မှ ထပ်ကြိုးစားပါ"},
            {"图片上传 IO异常", "Image upload failed", "อัปโหลดรูปไม่สำเร็จ", "ပုံတင်၍ မရပါ"},
            {"文件上传 IO异常", "File upload failed", "อัปโหลดไฟล์ไม่สำเร็จ", "ဖိုင်တင်၍ မရပါ"},
            {"文件目录创建失败...", "Failed to create upload folder", "สร้างโฟลเดอร์อัปโหลดไม่สำเร็จ", "တင်ရန် ဖိုလ်ဒါ ဖန်တီး၍ မရပါ"},
            {"目标文件创建失败...", "Failed to create upload file", "สร้างไฟล์อัปโหลดไม่สำเร็จ", "တင်ရန် ဖိုင် ဖန်တီး၍ မရပါ"},
            {"文件类型未定义，无法上传...", "Unknown file type, cannot upload", "ไม่รู้จักประเภทไฟล์ อัปโหลดไม่ได้", "ဖိုင်အမျိုးအစား မသိပါ၊ တင်၍မရပါ"},
            {"上载的文件对象不存在...", "Upload file is empty", "ไม่มีไฟล์อัปโหลด", "တင်ရန် ဖိုင် မရှိပါ"},
            {"登录密码不正确", "Incorrect password", "รหัสผ่านไม่ถูกต้อง", "စကားဝှက် မမှန်ကန်ပါ"},
            {"code码不存在", "Code does not exist", "ไม่มีโค้ดนี้", "ကုဒ် မရှိပါ"},
            {"请求微信失败，请稍后再试", "WeChat request failed, please try again later", "ขอข้อมูล WeChat ไม่สำเร็จ กรุณาลองใหม่", "WeChat တောင်းဆိုမှု မအောင်မြင်ပါ"},
            {"用户唯一标识获取失败", "Failed to get user identifier", "ดึงรหัสผู้ใช้ไม่สำเร็จ", "အသုံးပြုသူ ID ရယူမှု မအောင်မြင်ပါ"},
            {"用户名不存在", "Username does not exist", "ไม่มีชื่อผู้ใช้นี้", "အသုံးပြုသူအမည် မရှိပါ"},
            {"账号已被删除", "Account has been deleted", "บัญชีถูกลบแล้ว", "အကောင့် ဖျက်ပြီးပါပြီ"},
            {"账号已被禁用", "Account has been disabled", "บัญชีถูกปิดใช้งาน", "အကောင့် ပိတ်ထားသည်"},
            {"登录信息不能为空", "Login information cannot be empty", "ข้อมูลเข้าสู่ระบบต้องไม่ว่าง", "ဝင်ရောက်မှု အချက်အလက် မရှိ၍မရပါ"},
            {"账号不能为空", "Account cannot be empty", "บัญชีต้องไม่ว่าง", "အကောင့် မရှိ၍မရပါ"},
            {"密码不能为空", "Password cannot be empty", "รหัสผ่านต้องไม่ว่าง", "စကားဝှက် မရှိ၍မရပါ"},
            {"验证码不正确", "Incorrect captcha", "รหัสยืนยันไม่ถูกต้อง", "အတည်ပြုကုဒ် မမှန်ကန်ပါ"},
            {"未获取到您的昵称信息~", "Nickname not found", "ไม่พบชื่อเล่น", "အမည်ပြောင် မတွေ့ပါ"},
            {"未获取到您的头像信息~", "Avatar not found", "ไม่พบรูปโปรไฟล์", "ပရိုဖိုင်ပုံ မတွေ့ပါ"},
            {"openId不能为空", "openId cannot be empty", "openId ต้องไม่ว่าง", "openId မရှိ၍မရပါ"},
            {"用户不存在", "User does not exist", "ไม่มีผู้ใช้นี้", "အသုံးပြုသူ မရှိပါ"},
            {"登录状态已过期", "Login expired", "เซสชันหมดอายุ", "ဝင်ရောက်မှု သက်တမ်းကုန်ပါပြီ"},
            {"请配置一号通access_key一号通后台应用管理获得APPID！", "Please configure OnePass access_key (APPID) in OnePass app management", "กรุณาตั้งค่า OnePass access_key (APPID)", "OnePass access_key (APPID) ကို သတ်မှတ်ပါ"},
            {"请配置一号通secret_key一号通后台应用管理获得AppSecret", "Please configure OnePass secret_key (AppSecret) in OnePass app management", "กรุณาตั้งค่า OnePass secret_key (AppSecret)", "OnePass secret_key (AppSecret) ကို သတ်မှတ်ပါ"},
            {"短信业务未开通", "SMS service is not enabled", "ยังไม่ได้เปิดบริการ SMS", "SMS ဝန်ဆောင်မှု မဖွင့်ရသေးပါ"},
            {"短信业务数量不足", "Insufficient SMS quota", "โควต้า SMS ไม่พอ", "SMS အရေအတွက် မလုံလောက်ပါ"},
            {"一号通平台接口异常，没任何数据返回！", "OnePass API error: no data returned.", "OnePass API error: no data returned.", "OnePass API error: no data returned."},
            {"一号通平台接口异常！", "OnePass API error.", "OnePass API error.", "OnePass API error."},
            {"手机号不能为空", "Phone number cannot be empty", "เบอร์โทรต้องไม่ว่าง", "ဖုန်းနံပါတ် မရှိ၍မရပါ"},
            {"手机号已存在", "Phone number already exists", "เบอร์โทรนี้มีอยู่แล้ว", "ဖုန်းနံပါတ် ရှိပြီးသား"},
            {"手机号格式不正确，请重新输入", "Invalid phone number, please re-enter", "เบอร์โทรไม่ถูกต้อง กรุณากรอกใหม่", "ဖုန်းနံပါတ် မမှန်ပါ၊ ပြန်ထည့်ပါ"},
            {"手机号、验证码不能为空", "Phone number and captcha cannot be empty", "เบอร์โทรและรหัสยืนยันต้องไม่ว่าง", "ဖုန်းနံပါတ်နှင့် အတည်ပြုကုဒ် မရှိ၍မရပါ"},
            {"手机号码验证码不能为空", "Phone captcha cannot be empty", "รหัสยืนยันเบอร์โทรต้องไม่ว่าง", "ဖုန်း အတည်ပြုကုဒ် မရှိ၍မရပါ"},
            {"手机号验证码不能为空", "Phone captcha cannot be empty", "รหัสยืนยันเบอร์โทรต้องไม่ว่าง", "ဖုန်း အတည်ပြုကုဒ် မရှိ၍မရပါ"},
            {"验证码不能为空", "Captcha cannot be empty", "รหัสยืนยันต้องไม่ว่าง", "အတည်ပြုကုဒ် မရှိ၍မရပါ"},
            {"验证码信息不存在", "Captcha not found", "ไม่พบรหัสยืนยัน", "အတည်ပြုကုဒ် မတွေ့ပါ"},
            {"验证码已过期", "Captcha expired", "รหัสยืนยันหมดอายุ", "အတည်ပြုကုဒ် သက်တမ်းကုန်ပါပြီ"},
            {"验证码校验失败", "Captcha verification failed", "ตรวจสอบรหัสยืนยันไม่สำเร็จ", "အတည်ပြုကုဒ် စစ်ဆေးမှု မအောင်မြင်ပါ"},
            {"验证码格式不正确，必须为6位数字", "Captcha must be 6 digits", "รหัสยืนยันต้องเป็นตัวเลข 6 หลัก", "အတည်ပြုကုဒ်သည် ဂဏန်း ၆ လုံး ဖြစ်ရမည်"},
            {"验证码格式错误，验证码必须为6位数字", "Captcha format is invalid. Captcha must be 6 digits", "รูปแบบรหัสยืนยันไม่ถูกต้อง ต้องเป็นตัวเลข 6 หลัก", "အတည်ပြုကုဒ် ပုံစံ မမှန်ပါ။ ဂဏန်း ၆ လုံး ဖြစ်ရမည်"},
            {"手机号码格式错误", "Invalid phone number format", "รูปแบบเบอร์โทรไม่ถูกต้อง", "ဖုန်းနံပါတ် ပုံစံ မမှန်ကန်ပါ"},
            {"密码格式错误，密码必须以字母开头，长度在6~18之间，只能包含字符、数字和下划线", "Password must start with a letter, be 6–18 characters, and contain only letters, numbers, or underscore", "รหัสผ่านต้องขึ้นต้นด้วยตัวอักษร ความยาว 6–18 และมีได้เฉพาะตัวอักษร ตัวเลข และ _", "စကားဝှက်သည် စာလုံးဖြင့် စရမည်၊ ၆–၁၈ လုံး၊ စာလုံး/ဂဏန်း/_ သာ"},
            {"请输入6位验证码", "Please enter the 6-digit captcha", "กรุณากรอกรหัสยืนยัน 6 หลัก", "ဂဏန်း ၆ လုံး အတည်ပြုကုဒ် ထည့်ပါ"},
            {"请输入正确的手机号", "Please enter a valid phone number", "กรุณากรอกเบอร์โทรให้ถูกต้อง", "မှန်ကန်သော ဖုန်းနံပါတ် ထည့်ပါ"},
            {"请填写正确的手机号", "Please enter a valid phone number", "กรุณากรอกเบอร์โทรให้ถูกต้อง", "မှန်ကန်သော ဖုန်းနံပါတ် ထည့်ပါ"},
            {"绑定失败", "Bind failed", "ผูกไม่สำเร็จ", "ချိတ်မှု မအောင်မြင်ပါ"},
            {"绑定成功", "Bound successfully", "ผูกสำเร็จ", "ချိတ်မှု အောင်မြင်ပါသည်"},
            {"商品已存在", "Product already exists", "มีสินค้านี้อยู่แล้ว", "ကုန်ပစ္စည်း ရှိပြီးသား"},
            {"商品不存在", "Product does not exist", "ไม่มีสินค้านี้", "ကုန်ပစ္စည်း မရှိပါ"},
            {"商品已进入回收站", "Product is in the recycle bin", "สินค้าอยู่ในถังขยะ", "ကုန်ပစ္စည်းသည် ပြန်လည်အသုံးပြုတွင် ရှိသည်"},
            {"商品审核状态异常", "Product audit status is abnormal", "สถานะตรวจสินค้าผิดปกติ", "ကုန်ပစ္စည်း စစ်ဆေးမှု ပုံမှန်မဟုတ်ပါ"},
            {"商品已经删除", "Product has been deleted", "สินค้าถูกลบแล้ว", "ကုန်ပစ္စည်း ဖျက်ပြီးပါပြီ"},
            {"商品已上架", "Product is listed", "สินค้าขึ้นชั้นแล้ว", "ကုန်ပစ္စည်း တင်ပြီးပါပြီ"},
            {"商品审核中", "Product is under review", "สินค้ากำลังตรวจสอบ", "ကုန်ပစ္စည်း စစ်ဆေးနေသည်"},
            {"订单不存在", "Order does not exist", "ไม่มีคำสั่งซื้อนี้", "အော်ဒါ မရှိပါ"},
            {"订单已删除", "Order has been deleted", "คำสั่งซื้อถูกลบแล้ว", "အော်ဒါ ဖျက်ပြီးပါပြီ"},
            {"订单已退款", "Order has been refunded", "คำสั่งซื้อคืนเงินแล้ว", "အော်ဒါ ငွေပြန်ပြီးပါပြီ"},
            {"订单状态异常", "Order status is abnormal", "สถานะคำสั่งซื้อผิดปกติ", "အော်ဒါ အခြေအနေ ပုံမှန်မဟုတ်ပါ"},
            {"订单已经取消", "Order has been cancelled", "คำสั่งซื้อถูกยกเลิกแล้ว", "အော်ဒါ ပယ်ဖျက်ပြီးပါပြီ"},
            {"订单已经支付", "Order has been paid", "คำสั่งซื้อชำระแล้ว", "အော်ဒါ ပေးချေပြီးပါပြီ"},
            {"订单未支付", "Order is unpaid", "คำสั่งซื้อยังไม่ชำระ", "အော်ဒါ မပေးချေရသေးပါ"},
            {"订单已核销", "Order has been verified", "คำสั่งซื้อถูกยืนยันแล้ว", "အော်ဒါ အတည်ပြုပြီးပါပြီ"},
            {"退款单不存在", "Refund order does not exist", "ไม่มีใบคืนเงิน", "ငွေပြန်အော်ဒါ မရှိပါ"},
            {"退款单状态异常", "Refund status is abnormal", "สถานะคืนเงินผิดปกติ", "ငွေပြန် အခြေအနေ ပုံမှန်မဟုတ်ပါ"},
            {"商户已存在", "Merchant already exists", "มีร้านค้านี้อยู่แล้ว", "ဆိုင် ရှိပြီးသား"},
            {"商户不存在", "Merchant does not exist", "ไม่มีร้านค้านี้", "ဆိုင် မရှိပါ"},
            {"商户开关未开启", "Merchant switch is off", "สวิตช์ร้านค้ายังไม่เปิด", "ဆိုင် ခလုတ် မဖွင့်ရသေးပါ"},
            {"商户余额不足", "Insufficient merchant balance", "ยอดร้านค้าไม่พอ", "ဆိုင် လက်ကျန် မလုံလောက်ပါ"},
            {"优惠券不存在", "Coupon does not exist", "ไม่มีคูปองนี้", "ကူပွန် မရှိပါ"},
            {"当前用户已经领取过此优惠券了！", "You have already claimed this coupon", "คุณรับคูปองนี้ไปแล้ว", "ဤကူပွန်ကို လက်ခံပြီးပါပြီ"},
            {"优惠券余量不足！", "Coupon stock is insufficient", "คูปองไม่เพียงพอ", "ကူပွန် အရေအတွက် မလုံလောက်ပါ"},
            {"优惠券领取截止日期已过！", "The coupon claim deadline has passed", "หมดเวลารับคูปองแล้ว", "ကူပွန် လက်ခံသည့် ကန့်သတ်ရက် ကျော်သွားပါပြီ"},
            {"优惠券信息不存在或者已失效！", "Coupon not found or expired", "ไม่พบคูปอง หรือหมดอายุแล้ว", "ကူပွန် မရှိ သို့မဟုတ် သက်တမ်းကုန်ပါပြီ"},
            {"还未达到优惠券领取时间！", "Coupon claim has not started yet", "ยังไม่ถึงเวลารับคูปอง", "ကူပွန် လက်ခံချိန် မရောက်သေးပါ"},
            {"已超过优惠券领取最后期限！", "The coupon claim deadline has passed", "เลยกำหนดรับคูปองแล้ว", "ကူပွန် လက်ခံနောက်ဆုံးရက် ကျော်သွားပါပြီ"},
            {"此优惠券已经被领完了！", "This coupon has been fully claimed", "คูปองนี้ถูกรับหมดแล้ว", "ဤကူပွန် လက်ခံကုန်ပါပြီ"},
            {"自动领取优惠券失败", "Failed to auto-claim the coupon", "รับคูปองอัตโนมัติไม่สำเร็จ", "ကူပွန် အလိုအလျောက် လက်ခံမှု မအောင်မြင်ပါ"},
            {"优惠券数量不足！", "Coupon quantity is insufficient", "จำนวนคูปองไม่พอ", "ကူပွန် အရေအတွက် မလုံလောက်ပါ"},
            {"优惠券可领取时间已过", "Coupon claim period has ended", "หมดเวลารับคูปองแล้ว", "ကူပွန် လက်ခံချိန် ကုန်ပါပြီ"},
            {"优惠券使用有效期已过！", "The coupon has expired", "คูปองหมดอายุแล้ว", "ကူပွန် သက်တမ်းကုန်ပါပြီ"},
            {"优惠券领取记录不存在！", "Coupon claim record not found", "ไม่พบประวัติการรับคูปอง", "ကူပွန် လက်ခံမှတ်တမ်း မရှိပါ"},
            {"此优惠券已使用！", "This coupon has already been used", "คูปองนี้ถูกใช้แล้ว", "ဤကူပွန် အသုံးပြုပြီးပါပြီ"},
            {"此优惠券已失效！", "This coupon has expired", "คูปองนี้หมดอายุแล้ว", "ဤကူပွန် သက်တမ်းကုန်ပါပြီ"},
            {"此优惠券已经失效了", "This coupon has expired", "คูปองนี้หมดอายุแล้ว", "ဤကူပွန် သက်တမ်းကုန်ပါပြီ"},
            {"商家无此优惠券", "This merchant does not have this coupon", "ร้านค้าไม่มีคูปองนี้", "ဆိုင်တွင် ဤကူပွန် မရှိပါ"},
            {"支付宝支付未配置", "Alipay is not configured", "ยังไม่ได้ตั้งค่า Alipay", "Alipay မသတ်မှတ်ရသေးပါ"},
            {"付费会员卡不存在", "Paid member card does not exist", "ไม่มีบัตรสมาชิก", "အဖွဲ့ဝင်ကတ် မရှိပါ"},
            {"付费会员卡已关闭", "Paid member card is closed", "บัตรสมาชิกถูกปิด", "အဖွဲ့ဝင်ကတ် ပိတ်ထားသည်"},
            {"请重新选择会员卡", "Please select a member card again", "กรุณาเลือกบัตรสมาชิกใหม่", "အဖွဲ့ဝင်ကတ် ပြန်ရွေးပါ"},
            {"秒杀活动不存在", "Flash sale does not exist", "ไม่มีแฟลชเซลนี้", "ဖလက်ရှ်ရောင်း မရှိပါ"},
            {"秒杀活动已经结束", "Flash sale has ended", "แฟลชเซลสิ้นสุดแล้ว", "ဖလက်ရှ်ရောင်း ပြီးဆုံးပါပြီ"},
            {"文章不存在", "Article does not exist", "ไม่มีบทความนี้", "ဆောင်းပါး မရှိပါ"},
            {"管理员已存在", "Admin already exists", "มีผู้ดูแลระบบนี้อยู่แล้ว", "စီမံခန့်ခွဲသူ ရှိပြီးသား"},
            {"管理员不存在", "Admin does not exist", "ไม่มีผู้ดูแลระบบนี้", "စီမံခန့်ခွဲသူ မရှိပါ"},
            {"没有可导出的数据！", "No data to export!", "ไม่มีข้อมูลที่สามารถส่งออกได้!", "ထုတ်ယူရန် ဒေတာ မရှိပါ!"},
            {"没有可导出的数据", "No data to export!", "ไม่มีข้อมูลที่สามารถส่งออกได้!", "ထုတ်ယူရန် ဒေတာ မရှိပါ!"},
            {"请先在配置中进行商户转账信息配置", "Please configure merchant transfer information in Settings first", "กรุณาตั้งค่าข้อมูลการโอนเงินของร้านค้าในการตั้งค่าก่อน", "ဆက်တင်တွင် ဆိုင်လွှဲပြောင်းအချက်အလက်ကို အရင်သတ်မှတ်ပါ"},
            {"提现金额小于最小提现金额", "The withdrawal amount is less than the minimum", "จำนวนเงินถอนน้อยกว่าขั้นต่ำ", "ထုတ်ယူငွေသည် အနိမ့်ဆုံးထက် နည်းနေသည်"},
            {"提现金额大于最高提现金额", "The withdrawal amount exceeds the maximum", "จำนวนเงินถอนเกินจำนวนสูงสุด", "ထုတ်ယူငွေသည် အမြင့်ဆုံးထက် ကျော်နေသည်"},
            {"商户余额不足提现保证金", "Merchant balance is insufficient for the guarantee amount", "ยอดร้านค้าไม่พอสำหรับเงินประกัน", "ဆိုင်လက်ကျန်သည် အာမခံပမာဏအတွက် မလုံလောက်ပါ"},
            {"驳回时请填写驳回原因", "Please enter a rejection reason", "กรุณากรอกเหตุผลที่ไม่อนุมัติ", "ငြင်းပယ်ရသည့် အကြောင်းရင်း ထည့်ပါ"},
            {"不能获取非自己商户的数据", "Cannot access another merchant's data", "ไม่สามารถเข้าถึงข้อมูลร้านค้าอื่นได้", "အခြားဆိုင်၏ ဒေတာကို ကြည့်၍မရပါ"},
            {"请填写拒绝理由", "Please enter a rejection reason", "กรุณากรอกเหตุผลที่ปฏิเสธ", "ငြင်းပယ်ရသည့် အကြောင်းရင်း ထည့်ပါ"},
            {"审核拒绝请填写拒绝原因", "Please enter a rejection reason when rejecting", "เมื่อปฏิเสธกรุณากรอกเหตุผล", "ငြင်းပယ်သည့်အခါ အကြောင်းရင်း ထည့်ပါ"},
            {"多语言分类名称不能为空", "Please enter the category name", "กรุณากรอกชื่อหมวดหมู่", "အမျိုးအစားအမည် ထည့်ပါ"},
            {"分类名称必须填写", "Please enter the category name", "กรุณากรอกชื่อหมวดหมู่", "အမျိုးအစားအမည် ထည့်ပါ"},
            {"类型必须选择", "Please select a type", "กรุณาเลือกประเภท", "အမျိုးအစား ရွေးပါ"},
            {"状态必须选择", "Please select a status", "กรุณาเลือกสถานะ", "အခြေအနေ ရွေးပါ"},
            {"排序数字为空", "Please enter a sort number", "กรุณากรอกตัวเลขเรียงลำดับ", "စီရန် ဂဏန်း ထည့်ပါ"},
            {"分类名称重复", "Category name already exists", "ชื่อหมวดหมู่ซ้ำ", "အမျိုးအစားအမည် ရှိပြီးသား"},
            {"此分类已存在", "This category already exists", "หมวดหมู่นี้มีอยู่แล้ว", "ဤအမျိုးအစား ရှိပြီးသားဖြစ်သည်"},
            {"多语言商户简介不能为空", "Please enter the merchant introduction", "กรุณากรอกคำแนะนำร้านค้า", "ဆိုင်မိတ်ဆက် ထည့်ပါ"},
            {"商户简介不能为空", "Please enter the merchant introduction", "กรุณากรอกคำแนะนำร้านค้า", "ဆိုင်မိတ်ဆက် ထည့်ပါ"},
    };

    private static final String[][] HEADS = {
            {"一号通平台接口", "OnePass API: ", "OnePass API: ", "OnePass API: "},
            {"一号通采集商品异常：", "OnePass collect product error: ", "OnePass collect product error: ", "OnePass collect product error: "},
            {"一号通-电子面单失败：", "OnePass e-waybill failed: ", "OnePass e-waybill failed: ", "OnePass e-waybill failed: "},
    };

    /** 剩余中文片段，最长优先，用于词典半翻译或未收录整句 */
    private static final String[][] FRAGMENTS = {
            {"一号通后台应用管理获得APPID", "OnePass app management APPID", "OnePass app management APPID", "OnePass app management APPID"},
            {"一号通后台应用管理获得AppSecret", "OnePass app management AppSecret", "OnePass app management AppSecret", "OnePass app management AppSecret"},
            {"一号通平台接口", "OnePass API ", "OnePass API ", "OnePass API "},
            {"接口请求失败", "request failed", "คำขอไม่สำเร็จ", "တောင်းဆိုမှု မအောင်မြင်ပါ"},
            {"请求失败", "request failed", "คำขอไม่สำเร็จ", "တောင်းဆိုမှု မအောင်မြင်ပါ"},
            {"没任何数据返回", "no data returned", "ไม่มีข้อมูลส่งกลับ", "ဒေတာ ပြန်မလာပါ"},
            {"accessKey或者secretKey", "accessKey or secretKey", "accessKey or secretKey", "accessKey or secretKey"},
            {"请重新输入", "please re-enter", "กรุณากรอกใหม่", "ပြန်ထည့်ပါ"},
            {"请稍后再试", "please try again later", "กรุณาลองใหม่ภายหลัง", "နောက်မှ ထပ်ကြိုးစားပါ"},
            {"请稍后重试", "please try again later", "กรุณาลองใหม่ภายหลัง", "နောက်မှ ထပ်ကြိုးစားပါ"},
            {"格式不正确", " format is invalid", "รูปแบบไม่ถูกต้อง", "ပုံစံ မမှန်ကန်ပါ"},
            {"格式错误", " format is invalid", "รูปแบบไม่ถูกต้อง", "ပုံစံ မမှန်ကန်ပါ"},
            {"校验失败", " verification failed", "ตรวจสอบไม่สำเร็จ", "စစ်ဆေးမှု မအောင်မြင်ပါ"},
            {"必须为6位数字", " must be 6 digits", "ต้องเป็นตัวเลข 6 หลัก", "ဂဏန်း ၆ လုံး ဖြစ်ရမည်"},
            {"6位验证码", "6-digit captcha", "รหัสยืนยัน 6 หลัก", "ဂဏန်း ၆ လုံး အတည်ပြုကုဒ်"},
            {"正确的手机号", "a valid phone number", "เบอร์โทรที่ถูกต้อง", "မှန်ကန်သော ဖုန်းနံပါတ်"},
            {"手机号码", "phone number", "เบอร์โทร", "ဖုန်းနံပါတ်"},
            {"手机号", "phone number", "เบอร์โทร", "ဖုန်းနံပါတ်"},
            {"验证码", "captcha", "รหัสยืนยัน", "အတည်ပြုကုဒ်"},
            {"短信业务", "SMS service", "บริการ SMS", "SMS ဝန်ဆောင်မှု"},
            {"未开通", " is not enabled", "ยังไม่ได้เปิด", "မဖွင့်ရသေးပါ"},
            {"数量不足", " quota is insufficient", "จำนวนไม่พอ", "အရေအတွက် မလုံလောက်ပါ"},
            {"已被删除", " has been deleted", "ถูกลบแล้ว", "ဖျက်ပြီးပါပြီ"},
            {"已被禁用", " has been disabled", "ถูกปิดใช้งาน", "ပိတ်ထားသည်"},
            {"已经注销", " has been cancelled", "ถูกยกเลิกแล้ว", "ပယ်ဖျက်ပြီးပါပြီ"},
            {"已经取消", " has been cancelled", "ถูกยกเลิกแล้ว", "ပယ်ဖျက်ပြီးပါပြီ"},
            {"已经支付", " has been paid", "ชำระแล้ว", "ပေးချေပြီးပါပြီ"},
            {"已经删除", " has been deleted", "ถูกลบแล้ว", "ဖျက်ပြီးပါပြီ"},
            {"已经结束", " has ended", "สิ้นสุดแล้ว", "ပြီးဆုံးပါပြီ"},
            {"已过期", " has expired", "หมดอายุแล้ว", "သက်တမ်းကုန်ပါပြီ"},
            {"已关闭", " is closed", "ปิดแล้ว", "ပိတ်ထားသည်"},
            {"未支付", " is unpaid", "ยังไม่ชำระ", "မပေးချေရသေးပါ"},
            {"未登录", " not signed in", "ยังไม่ได้เข้าสู่ระบบ", "မဝင်ရသေးပါ"},
            {"请登录", "please sign in", "กรุณาเข้าสู่ระบบ", "ဝင်ရောက်ပါ"},
            {"系统异常", "system error", "ระบบผิดพลาด", "စနစ်အမှား"},
            {"参数检验失败", "validation failed", "ตรวจสอบพารามิเตอร์ไม่ผ่าน", "ကန့်သတ်ချက် စစ်ဆေးမှု မအောင်မြင်ပါ"},
            {"无访问权限", "no permission", "ไม่มีสิทธิ์", "ခွင့်ပြုချက် မရှိပါ"},
            {"资源未找到", "resource not found", "ไม่พบทรัพยากร", "အရင်းအမြစ် မတွေ့ပါ"},
            {"登录密码", "login password", "รหัสผ่านเข้าสู่ระบบ", "ဝင်ရောက် စကားဝှက်"},
            {"登录状态", "login session", "สถานะการเข้าสู่ระบบ", "ဝင်ရောက်မှု အခြေအနေ"},
            {"登录信息", "login information", "ข้อมูลเข้าสู่ระบบ", "ဝင်ရောက်မှု အချက်အလက်"},
            {"唯一标识", "identifier", "รหัสเฉพาะ", "ထူးခြား ID"},
            {"获取失败", " failed to get", "ดึงข้อมูลไม่สำเร็จ", "ရယူမှု မအောင်မြင်ပါ"},
            {"微信公众号", "WeChat official account", "บัญชีทางการ WeChat", "WeChat တရားဝင်အကောင့်"},
            {"微信小程序", "WeChat mini program", "มินิโปรแกรม WeChat", "WeChat မီနီပရိုဂရမ်"},
            {"微信支付", "WeChat Pay", "WeChat Pay", "WeChat Pay"},
            {"支付宝支付", "Alipay", "Alipay", "Alipay"},
            {"电子面单", "e-waybill", "ใบนำส่งอิเล็กทรอนิกส์", "အီလက်ထရွန် ပို့ဆောင်လက်မှတ်"},
            {"绑定关系", "binding", "ความผูกพัน", "ချိတ်နှောင်မှု"},
            {"请先为", "Please set ", "กรุณาตั้งค่า", "အရင် သတ်မှတ်ပါ "},
            {"请认证微信账号：获取手机号码失败", "WeChat account verification failed: cannot get phone number", "ยืนยันบัญชี WeChat ไม่สำเร็จ", "WeChat အကောင့် အတည်ပြု မအောင်မြင်ပါ"},
            {"用户已经注销", "User has been cancelled", "ผู้ใช้ถูกยกเลิกแล้ว", "အသုံးပြုသူ ပယ်ဖျက်ပြီးပါပြီ"},
            {"用户未收藏商户", "User has not favorited this merchant", "ผู้ใช้ยังไม่ได้ติดตามร้านค้า", "အသုံးပြုသူသည် ဆိုင်ကို စုစည်းမထားပါ"},
            {"用户结算申请正常处理中", "User settlement is being processed", "กำลังดำเนินการคำขอชำระเงิน", "အသုံးပြုသူ ငွေရှင်း တောင်းဆိုမှု စီမံနေသည်"},
            {"用户结算单审核状态异常", "User settlement audit status is abnormal", "สถานะตรวจสอบใบชำระเงินผิดปกติ", "အသုံးပြုသူ ငွေရှင်း စစ်ဆေးမှု ပုံမှန်မဟုတ်ပါ"},
            {"用户结算单不存在", "User settlement does not exist", "ไม่มีใบชำระเงิน", "အသုံးပြုသူ ငွေရှင်း မရှိပါ"},
            {"用户佣金不足", "Insufficient commission", "คอมมิชชันไม่พอ", "ကော်မရှင် မလုံလောက်ပါ"},
            {"用户标签正在使用中", "User tag is in use", "แท็กผู้ใช้กำลังใช้งาน", "အသုံးပြုသူ တဂ် အသုံးပြုနေသည်"},
            {"用户地址创建失败", "Failed to create user address", "สร้างที่อยู่ไม่สำเร็จ", "လိပ်စာ ဖန်တီးမှု မအောင်မြင်ပါ"},
            {"用户地址不存在", "User address does not exist", "ไม่มีที่อยู่ผู้ใช้", "အသုံးပြုသူ လိပ်စာ မရှိပါ"},
            {"用户余额不足", "Insufficient balance", "ยอดเงินไม่พอ", "လက်ကျန် မလုံလောက်ပါ"},
            {"用户手机号已存在", "User phone already exists", "เบอร์โทรผู้ใช้มีอยู่แล้ว", "အသုံးပြုသူ ဖုန်း ရှိပြီးသား"},
            {"用户注册失败", "User registration failed", "ลงทะเบียนไม่สำเร็จ", "မှတ်ပုံတင်မှု မအောင်မြင်ပါ"},
            {"用户注销失败", "Failed to cancel user", "ยกเลิกผู้ใช้ไม่สำเร็จ", "အသုံးပြုသူ ပယ်ဖျက်မှု မအောင်မြင်ပါ"},
            {"用户状态异常", "User status is abnormal", "สถานะผู้ใช้ผิดปกติ", "အသုံးပြုသူ အခြေအနေ ပုံမှန်မဟုတ်ပါ"},
            {"用户已存在", "User already exists", "มีผู้ใช้นี้อยู่แล้ว", "အသုံးပြုသူ ရှိပြီးသား"},
            {"请选择用户", "Please select a user", "กรุณาเลือกผู้ใช้", "အသုံးပြုသူ ရွေးပါ"},
            {"最小提现金额", "the minimum withdrawal amount", "จำนวนถอนขั้นต่ำ", "အနိမ့်ဆုံး ထုတ်ယူငွေ"},
            {"最高提现金额", "the maximum withdrawal amount", "จำนวนถอนสูงสุด", "အမြင့်ဆုံး ထုတ်ယူငွေ"},
            {"提现保证金", "guarantee amount", "เงินประกันการถอน", "ထုတ်ယူ အာမခံပမာဏ"},
            {"提现金额", "withdrawal amount", "จำนวนเงินถอน", "ထုတ်ယူငွေ"},
            {"提现申请", "withdrawal application", "คำขอถอนเงิน", "ငွေထုတ် လျှောက်လွှာ"},
            {"提现方式", "withdrawal method", "วิธีถอนเงิน", "ငွေထုတ်နည်း"},
            {"转账信息", "transfer information", "ข้อมูลการโอน", "လွှဲပြောင်း အချက်အလက်"},
            {"转账金额", "transfer amount", "จำนวนเงินโอน", "လွှဲငွေ ပမာဏ"},
            {"转账类型", "transfer type", "ประเภทการโอน", "လွှဲပြောင်း အမျိုးအစား"},
            {"转账备注", "transfer remark", "หมายเหตุการโอน", "လွှဲပြောင်း မှတ်ချက်"},
            {"结算申请", "settlement application", "คำขอชำระเงิน", "ငွေရှင်း လျှောက်လွှာ"},
            {"余额不足", "insufficient balance", "ยอดคงเหลือไม่พอ", "လက်ကျန် မလုံလောက်"},
            {"驳回原因", "rejection reason", "เหตุผลที่ไม่อนุมัติ", "ငြင်းပယ်ရသည့် အကြောင်းရင်း"},
            {"拒绝原因", "rejection reason", "เหตุผลที่ปฏิเสธ", "ငြင်းပယ်ရသည့် အကြောင်းရင်း"},
            {"拒绝理由", "rejection reason", "เหตุผลที่ปฏิเสธ", "ငြင်းပယ်ရသည့် အကြောင်းရင်း"},
            {"不能小于等于", " cannot be less than or equal to ", " ต้องไม่น้อยกว่าหรือเท่ากับ ", " ထက် မငယ်ရ သို့မဟုတ် မညီရပါ "},
            {"不能小于", " cannot be less than ", " ต้องไม่น้อยกว่า ", " ထက် မငယ်ရပါ "},
            {"不能大于", " cannot be greater than ", " ต้องไม่มากกว่า ", " ထက် မကြီးရပါ "},
            {"小于", " is less than ", " น้อยกว่า ", " ထက် နည်းသည် "},
            {"大于", " is greater than ", " มากกว่า ", " ထက် ကြီးသည် "},
            {"不正确", " is incorrect", " ไม่ถูกต้อง", " မမှန်ကန်ပါ"},
            {"不合法", " is invalid", " ไม่ถูกต้อง", " မမှန်ကန်ပါ"},
            {"，", ", ", ", ", ", "},
    };

    /** 最长优先：中文主语 -> en, th, my */
    private static final String[][] SUBJECTS = {
            {"运费模板", "shipping template", "เทมเพลตค่าจัดส่ง", "ပို့ဆောင်ခ ပုံစံ"},
            {"后台管理员", "admin", "ผู้ดูแลระบบ", "စီမံခန့်ခွဲသူ"},
            {"草稿商品", "draft product", "สินค้าฉบับร่าง", "မူကြမ်းကုန်ပစ္စည်း"},
            {"卡密列表", "card secret list", "รายการรหัสบัตร", "ကဒ်လျှို့ဝှက် စာရင်း"},
            {"卡密库", "CDKey library", "คลังรหัสบัตร", "ကဒ်လျှို့ဝှက် စာကြည့်တိုက်"},
            {"卡密", "card secret", "รหัสบัตร", "ကဒ်လျှို့ဝှက်"},
            {"优惠券开关", "coupon switch", "สวิตช์คูปอง", "ကူပွန်ခလုတ်"},
            {"优惠券", "coupon", "คูปอง", "ကူပွန်"},
            {"秒杀时段", "flash sale period", "ช่วงเวลาแฟลชเซล", "ဖလက်ရှ်ရောင်း အချိန်ကာလ"},
            {"秒杀商品", "flash sale product", "สินค้าแฟลชเซล", "ဖလက်ရှ်ရောင်း ကုန်ပစ္စည်း"},
            {"秒杀活动", "flash sale activity", "กิจกรรมแฟลชเซล", "ဖလက်ရှ်ရောင်း လှုပ်ရှားမှု"},
            {"积分商品", "points product", "สินค้าแต้ม", "ပွိုင့်ကုန်ပစ္စည်း"},
            {"角色状态", "role status", "สถานะบทบาท", "အခန်းကဏ္ဍ အခြေအနေ"},
            {"商户分类", "merchant category", "หมวดหมู่ร้านค้า", "ဆိုင်အမျိုးအစား"},
            {"商户类型", "merchant type", "ประเภทร้านค้า", "ဆိုင်အမျိုးအစား"},
            {"商户手机号", "merchant phone", "เบอร์โทรร้านค้า", "ဆိုင်ဖုန်း"},
            {"商户密码", "merchant password", "รหัสผ่านร้านค้า", "ဆိုင်စကားဝှက်"},
            {"商户", "merchant", "ร้านค้า", "ဆိုင်"},
            {"商品分类", "product category", "หมวดหมู่สินค้า", "ကုန်ပစ္စည်းအမျိုးအစား"},
            {"商品品牌", "product brand", "แบรนด์สินค้า", "ကုန်ပစ္စည်းအမှတ်တံဆိပ်"},
            {"保障服务", "guarantee", "บริการรับประกัน", "အာမခံဝန်ဆောင်မှု"},
            {"管理员", "admin", "ผู้ดูแลระบบ", "စီမံခန့်ခွဲသူ"},
            {"物流公司", "express company", "บริษัทขนส่ง", "ပို့ဆောင်ရေးကုမ္ပဏီ"},
            {"发货单配送信息", "shipment delivery info", "ข้อมูลจัดส่ง", "ပို့ဆောင်အချက်အလက်"},
            {"开关状态", "switch status", "สถานะสวิตช์", "ခလုတ်အခြေအနေ"},
            {"PC商城设置", "PC mall settings", "ตั้งค่าหน้าร้าน PC", "PC ဆိုင် ဆက်တင်"},
            {"生日有礼配置", "birthday gift config", "ของขวัญวันเกิด", "မွေးနေ့လက်ဆောင်"},
            {"新人礼配置", "new user gift config", "ของขวัญสมาชิกใหม่", "လူသစ်လက်ဆောင်"},
            {"文章分类", "article category", "หมวดหมู่บทความ", "ဆောင်းပါးအမျိုးအစား"},
            {"付费会员卡", "paid member card", "บัตรสมาชิก", "အခကြေးငွေ အဖွဲ့ဝင်ကတ်"},
            {"付费会员订单", "paid member order", "คำสั่งซื้อสมาชิก", "အခကြေးငွေ အဖွဲ့ဝင် အော်ဒါ"},
            {"退款单", "refund order", "ใบคืนเงิน", "ငွေပြန်အော်ဒါ"},
            {"预下单订单", "pre-order", "คำสั่งซื้อล่วงหน้า", "ကြိုတင်အော်ဒါ"},
            {"发货单", "shipment", "ใบจัดส่ง", "ပို့ဆောင်လက်မှတ်"},
            {"消息通知", "notification", "การแจ้งเตือน", "အကြောင်းကြားချက်"},
            {"短信模板", "SMS template", "เทมเพลต SMS", "SMS ပုံစံ"},
            {"签到配置", "check-in config", "ตั้งค่าเช็กอิน", "လက်မှတ်ထိုး ဆက်တင်"},
            {"系统用户等级", "user level", "ระดับผู้ใช้", "အသုံးပြုသူ အဆင့်"},
            {"城市区域", "city region", "เขตเมือง", "မြို့ဒေသ"},
            {"快递公司", "express company", "บริษัทขนส่ง", "ပို့ဆောင်ရေးကုမ္ပဏီ"},
            {"模板表单", "form template", "เทมเพลตฟอร์ม", "ဖောင် ပုံစံ"},
            {"社区分类", "community category", "หมวดหมู่ชุมชน", "ကွန်မြူနတီ အမျိုးအစား"},
            {"社区话题", "community topic", "หัวข้อชุมชน", "ကွန်မြူနတီ ခေါင်းစဉ်"},
            {"社区笔记", "community note", "โน้ตชุมชน", "ကွန်မြူနတီ မှတ်ချက်"},
            {"社区评论", "community comment", "ความคิดเห็นชุมชน", "ကွန်မြူနတီ မှတ်ချက်"},
            {"社区内容", "community content", "เนื้อหาชุมชน", "ကွန်မြူနတီ အကြောင်းအရာ"},
            {"打印机", "printer", "เครื่องพิมพ์", "ပရင်တာ"},
            {"账号", "account", "บัญชี", "အကောင့်"},
            {"密码", "password", "รหัสผ่าน", "စကားဝှက်"},
            {"地址", "address", "ที่อยู่", "လိပ်စာ"},
            {"评论", "comment", "ความคิดเห็น", "မှတ်ချက်"},
            {"库存", "stock", "สต็อก", "စာရင်း"},
            {"规格", "spec", "สเปก", "သတ်မှတ်ချက်"},
            {"微信", "WeChat", "WeChat", "WeChat"},
            {"小程序", "mini program", "มินิโปรแกรม", "မီနီပရိုဂရမ်"},
            {"公众号", "official account", "บัญชีทางการ", "တရားဝင်အကောင့်"},
            {"结算单", "settlement", "ใบชำระเงิน", "ငွေရှင်းလက်မှတ်"},
            {"标签", "tag", "แท็ก", "တဂ်"},
            {"昵称", "nickname", "ชื่อเล่น", "အမည်ပြောင်"},
            {"头像", "avatar", "รูปโปรไฟล์", "ပရိုဖိုင်ပုံ"},
            {"表单", "form", "ฟอร์ม", "ဖောင်"},
            {"商品", "product", "สินค้า", "ကုန်ပစ္စည်း"},
            {"订单", "order", "คำสั่งซื้อ", "အော်ဒါ"},
            {"菜单", "menu", "เมนู", "မီနူး"},
            {"角色", "role", "บทบาท", "အခန်းကဏ္ဍ"},
            {"缓存", "cache", "แคช", "ကက်ရှ်"},
            {"分类", "category", "หมวดหมู่", "အမျိုးအစား"},
            {"品牌", "brand", "แบรนด์", "အမှတ်တံဆိပ်"},
            {"用户", "user", "ผู้ใช้", "အသုံးပြုသူ"},
            {"名称", "name", "ชื่อ", "အမည်"},
            {"类型", "type", "ประเภท", "အမျိုးအစား"},
            {"状态", "status", "สถานะ", "အခြေအနေ"},
            {"数量", "quantity", "จำนวน", "အရေအတွက်"},
            {"图片", "image", "รูปภาพ", "ပုံ"},
            {"附件", "attachment", "ไฟล์แนบ", "ပူးတွဲဖိုင်"},
            {"城市", "city", "เมือง", "မြို့"},
            {"列表", "list", "รายการ", "စာရင်း"},
            {"参数", "parameter", "พารามิเตอร์", "ကန့်သတ်ချက်"},
    };

    /** 动词：enOkTpl / enFailTpl 使用 {0} 放主语，主语为空时用 enOkEmpty / enFailEmpty */
    private static final String[][] VERBS = {
            {"新增", "Added {0} successfully", "Failed to add {0}", "Added successfully", "Add failed",
                    "เพิ่ม{0}สำเร็จ", "เพิ่ม{0}ไม่สำเร็จ", "เพิ่มสำเร็จ", "เพิ่มไม่สำเร็จ",
                    "{0} ထည့်သွင်းမှု အောင်မြင်ပါသည်", "{0} ထည့်သွင်းမှု မအောင်မြင်ပါ", "ထည့်သွင်းမှု အောင်မြင်ပါသည်", "ထည့်သွင်းမှု မအောင်မြင်ပါ"},
            {"添加", "Added {0} successfully", "Failed to add {0}", "Added successfully", "Add failed",
                    "เพิ่ม{0}สำเร็จ", "เพิ่ม{0}ไม่สำเร็จ", "เพิ่มสำเร็จ", "เพิ่มไม่สำเร็จ",
                    "{0} ထည့်သွင်းမှု အောင်မြင်ပါသည်", "{0} ထည့်သွင်းမှု မအောင်မြင်ပါ", "ထည့်သွင်းမှု အောင်မြင်ပါသည်", "ထည့်သွင်းမှု မအောင်မြင်ပါ"},
            {"删除", "Deleted {0} successfully", "Failed to delete {0}", "Deleted successfully", "Delete failed",
                    "ลบ{0}สำเร็จ", "ลบ{0}ไม่สำเร็จ", "ลบสำเร็จ", "ลบไม่สำเร็จ",
                    "{0} ဖျက်သိမ်းမှု အောင်မြင်ပါသည်", "{0} ဖျက်သိမ်းမှု မအောင်မြင်ပါ", "ဖျက်သိမ်းမှု အောင်မြင်ပါသည်", "ဖျက်သိမ်းမှု မအောင်မြင်ပါ"},
            {"编辑", "Updated {0} successfully", "Failed to update {0}", "Updated successfully", "Update failed",
                    "แก้ไข{0}สำเร็จ", "แก้ไข{0}ไม่สำเร็จ", "แก้ไขสำเร็จ", "แก้ไขไม่สำเร็จ",
                    "{0} ပြင်ဆင်မှု အောင်မြင်ပါသည်", "{0} ပြင်ဆင်မှု မအောင်မြင်ပါ", "ပြင်ဆင်မှု အောင်မြင်ပါသည်", "ပြင်ဆင်မှု မအောင်မြင်ပါ"},
            {"修改", "Updated {0} successfully", "Failed to update {0}", "Updated successfully", "Update failed",
                    "แก้ไข{0}สำเร็จ", "แก้ไข{0}ไม่สำเร็จ", "แก้ไขสำเร็จ", "แก้ไขไม่สำเร็จ",
                    "{0} ပြင်ဆင်မှု အောင်မြင်ပါသည်", "{0} ပြင်ဆင်မှု မအောင်မြင်ပါ", "ပြင်ဆင်မှု အောင်မြင်ပါသည်", "ပြင်ဆင်မှု မအောင်မြင်ပါ"},
            {"保存", "Saved {0} successfully", "Failed to save {0}", "Saved successfully", "Save failed",
                    "บันทึก{0}สำเร็จ", "บันทึก{0}ไม่สำเร็จ", "บันทึกสำเร็จ", "บันทึกไม่สำเร็จ",
                    "{0} သိမ်းဆည်းမှု အောင်မြင်ပါသည်", "{0} သိမ်းဆည်းမှု မအောင်မြင်ပါ", "သိမ်းဆည်းမှု အောင်မြင်ပါသည်", "သိမ်းဆည်းမှု မအောင်မြင်ပါ"},
            {"更改", "Changed {0} successfully", "Failed to change {0}", "Changed successfully", "Change failed",
                    "เปลี่ยนแปลง{0}สำเร็จ", "เปลี่ยนแปลง{0}ไม่สำเร็จ", "เปลี่ยนแปลงสำเร็จ", "เปลี่ยนแปลงไม่สำเร็จ",
                    "{0} ပြောင်းလဲမှု အောင်မြင်ပါသည်", "{0} ပြောင်းလဲမှု မအောင်မြင်ပါ", "ပြောင်းလဲမှု အောင်မြင်ပါသည်", "ပြောင်းလဲမှု မအောင်မြင်ပါ"},
            {"设置", "Set {0} successfully", "Failed to set {0}", "Set successfully", "Set failed",
                    "ตั้งค่า{0}สำเร็จ", "ตั้งค่า{0}ไม่สำเร็จ", "ตั้งค่าสำเร็จ", "ตั้งค่าไม่สำเร็จ",
                    "{0} သတ်မှတ်မှု အောင်မြင်ပါသည်", "{0} သတ်မှတ်မှု မအောင်မြင်ပါ", "သတ်မှတ်မှု အောင်မြင်ပါသည်", "သတ်မှတ်မှု မအောင်မြင်ပါ"},
            {"同步", "Synced {0} successfully", "Failed to sync {0}", "Synced successfully", "Sync failed",
                    "ซิงก์{0}สำเร็จ", "ซิงก์{0}ไม่สำเร็จ", "ซิงก์สำเร็จ", "ซิงก์ไม่สำเร็จ",
                    "{0} စင့်ခ် အောင်မြင်ပါသည်", "{0} စင့်ခ် မအောင်မြင်ပါ", "စင့်ခ် အောင်မြင်ပါသည်", "စင့်ခ် မအောင်မြင်ပါ"},
            {"发送", "Sent {0} successfully", "Failed to send {0}", "Sent successfully", "Send failed",
                    "ส่ง{0}สำเร็จ", "ส่ง{0}ไม่สำเร็จ", "ส่งสำเร็จ", "ส่งไม่สำเร็จ",
                    "{0} ပို့မှု အောင်မြင်ပါသည်", "{0} ပို့မှု မအောင်မြင်ပါ", "ပို့မှု အောင်မြင်ပါသည်", "ပို့မှု မအောင်မြင်ပါ"},
            {"开启", "Enabled {0} successfully", "Failed to enable {0}", "Enabled successfully", "Enable failed",
                    "เปิด{0}สำเร็จ", "เปิด{0}ไม่สำเร็จ", "เปิดสำเร็จ", "เปิดไม่สำเร็จ",
                    "{0} ဖွင့်မှု အောင်မြင်ပါသည်", "{0} ဖွင့်မှု မအောင်မြင်ပါ", "ဖွင့်မှု အောင်မြင်ပါသည်", "ဖွင့်မှု မအောင်မြင်ပါ"},
            {"关闭", "Closed {0} successfully", "Failed to close {0}", "Closed successfully", "Close failed",
                    "ปิด{0}สำเร็จ", "ปิด{0}ไม่สำเร็จ", "ปิดสำเร็จ", "ปิดไม่สำเร็จ",
                    "{0} ပိတ်မှု အောင်မြင်ပါသည်", "{0} ပိတ်မှု မအောင်မြင်ပါ", "ပိတ်မှု အောင်မြင်ပါသည်", "ပိတ်မှု မအောင်မြင်ပါ"},
            {"重置", "Reset {0} successfully", "Failed to reset {0}", "Reset successfully", "Reset failed",
                    "รีเซ็ต{0}สำเร็จ", "รีเซ็ต{0}ไม่สำเร็จ", "รีเซ็ตสำเร็จ", "รีเซ็ตไม่สำเร็จ",
                    "{0} ပြန်သတ်မှတ်မှု အောင်မြင်ပါသည်", "{0} ပြန်သတ်မှတ်မှု မအောင်မြင်ပါ", "ပြန်သတ်မှတ်မှု အောင်မြင်ပါသည်", "ပြန်သတ်မှတ်မှု မအောင်မြင်ပါ"},
            {"切换", "Switched {0} successfully", "Failed to switch {0}", "Switched successfully", "Switch failed",
                    "สลับ{0}สำเร็จ", "สลับ{0}ไม่สำเร็จ", "สลับสำเร็จ", "สลับไม่สำเร็จ",
                    "{0} ပြောင်းမှု အောင်မြင်ပါသည်", "{0} ပြောင်းမှု မအောင်မြင်ပါ", "ပြောင်းမှု အောင်မြင်ပါသည်", "ပြောင်းမှု မအောင်မြင်ပါ"},
            {"变更", "Changed {0} successfully", "Failed to change {0}", "Changed successfully", "Change failed",
                    "เปลี่ยนแปลง{0}สำเร็จ", "เปลี่ยนแปลง{0}ไม่สำเร็จ", "เปลี่ยนแปลงสำเร็จ", "เปลี่ยนแปลงไม่สำเร็จ",
                    "{0} ပြောင်းလဲမှု အောင်မြင်ပါသည်", "{0} ပြောင်းလဲမှု မအောင်မြင်ပါ", "ပြောင်းလဲမှု အောင်မြင်ပါသည်", "ပြောင်းလဲမှု မအောင်မြင်ပါ"},
            {"更新", "Updated {0} successfully", "Failed to update {0}", "Updated successfully", "Update failed",
                    "อัปเดต{0}สำเร็จ", "อัปเดต{0}ไม่สำเร็จ", "อัปเดตสำเร็จ", "อัปเดตไม่สำเร็จ",
                    "{0} အပ်ဒိတ် အောင်မြင်ပါသည်", "{0} အပ်ဒိတ် မအောင်မြင်ပါ", "အပ်ဒိတ် အောင်မြင်ပါသည်", "အပ်ဒိတ် မအောင်မြင်ပါ"},
            {"备注", "Noted {0} successfully", "Failed to note {0}", "Noted successfully", "Note failed",
                    "บันทึกหมายเหตุ{0}สำเร็จ", "บันทึกหมายเหตุ{0}ไม่สำเร็จ", "บันทึกหมายเหตุสำเร็จ", "บันทึกหมายเหตุไม่สำเร็จ",
                    "{0} မှတ်ချက် အောင်မြင်ပါသည်", "{0} မှတ်ချက် မအောင်မြင်ပါ", "မှတ်ချက် အောင်မြင်ပါသည်", "မှတ်ချက် မအောင်မြင်ပါ"},
    };

    /** 操作日志接口描述：动词 + 主语，无“成功/失败” */
    private static final String[][] ACTION_VERBS = {
            {"批量恢复回收站", "Batch restore recycle bin {0}", "กู้คืนถังขยะ{0}แบบกลุ่ม", "{0} ပြန်လည်အသုံးပြု အစုလိုက် ပြန်ယူ"},
            {"批量加入回收站", "Batch move {0} to recycle bin", "ย้าย{0}ลงถังขยะแบบกลุ่ม", "{0} ပြန်လည်အသုံးပြုသို့ အစုလိုက် ပို့"},
            {"批量上架", "Batch list {0}", "ขึ้นชั้น{0}แบบกลุ่ม", "{0} အစုလိုက် တင်မည်"},
            {"批量下架", "Batch delist {0}", "ลงชั้น{0}แบบกลุ่ม", "{0} အစုလိုက် ချမည်"},
            {"批量删除", "Batch delete {0}", "ลบ{0}แบบกลุ่ม", "{0} အစုလိုက် ဖျက်"},
            {"批量提审", "Batch submit {0} for review", "ส่ง{0}ตรวจแบบกลุ่ม", "{0} အစုလိုက် စစ်ဆေးတင်"},
            {"快捷添加", "Quick add {0}", "เพิ่ม{0}ด่วน", "{0} အမြန် ထည့်"},
            {"免审编辑", "Edit {0} without review", "แก้ไข{0}โดยไม่ตรวจ", "{0} စစ်ဆေးမဲ့ ပြင်"},
            {"新增", "Add {0}", "เพิ่ม{0}", "{0} ထည့်သွင်း"},
            {"添加", "Add {0}", "เพิ่ม{0}", "{0} ထည့်သွင်း"},
            {"删除", "Delete {0}", "ลบ{0}", "{0} ဖျက်သိမ်း"},
            {"编辑", "Edit {0}", "แก้ไข{0}", "{0} ပြင်ဆင်"},
            {"修改", "Modify {0}", "แก้ไข{0}", "{0} ပြင်ဆင်"},
            {"上架", "List {0}", "ขึ้นชั้น{0}", "{0} တင်မည်"},
            {"下架", "Delist {0}", "ลงชั้น{0}", "{0} ချမည်"},
            {"导出", "Export {0}", "ส่งออก{0}", "{0} ထုတ်ယူ"},
            {"查询", "Query {0}", "ค้นหา{0}", "{0} ရှာဖွေ"},
            {"重置", "Reset {0}", "รีเซ็ต{0}", "{0} ပြန်သတ်မှတ်"},
            {"开通", "Enable {0}", "เปิดใช้{0}", "{0} ဖွင့်"},
            {"关闭", "Close {0}", "ปิด{0}", "{0} ပိတ်"},
            {"开启", "Enable {0}", "เปิด{0}", "{0} ဖွင့်"},
            {"备注", "Remark {0}", "หมายเหตุ{0}", "{0} မှတ်ချက်"},
            {"提审", "Submit {0} for review", "ส่ง{0}ตรวจ", "{0} စစ်ဆေးတင်"},
            {"恢复", "Restore {0}", "กู้คืน{0}", "{0} ပြန်ယူ"},
            {"撤回", "Withdraw {0}", "ถอน{0}", "{0} ပြန်ရုပ်"},
    };

    private static final String[][] METHOD_TYPES = {
            {"增加", "Add", "เพิ่ม", "ထည့်သွင်း"},
            {"修改", "Modify", "แก้ไข", "ပြင်ဆင်"},
            {"删除", "Delete", "ลบ", "ဖျက်သိမ်း"},
            {"查询", "Query", "ค้นหา", "ရှာဖွေ"},
            {"导出", "Export", "ส่งออก", "ထုတ်ယူ"},
    };

    private static final String[][] SUFFIXES = {
            {"不能为空", " cannot be empty", " ต้องไม่ว่าง", " မရှိ၍မရပါ"},
            {"不能为null", " cannot be null", " ต้องไม่เป็นค่าว่าง", " null မဖြစ်ရပါ"},
            {"不存在", " does not exist", " ไม่มีอยู่", " မရှိပါ"},
            {"已存在", " already exists", " มีอยู่แล้ว", " ရှိပြီးသားဖြစ်သည်"},
            {"已使用", " already in use", " ถูกใช้งานแล้ว", " အသုံးပြုထားပြီး"},
            {"不正确", " is incorrect", " ไม่ถูกต้อง", " မမှန်ကန်ပါ"},
            {"异常", " is abnormal", " ผิดปกติ", " ပုံမှန်မဟုတ်ပါ"},
    };

    /** 请选择/请输入：en/th/my with {0}，空主语用 empty 模板 */
    private static final String[][] PREFIXES = {
            {"请选择", "Please select {0}", "กรุณาเลือก{0}", "{0} ကို ရွေးပါ", "Please select", "กรุณาเลือก", "ရွေးပါ"},
            {"请输入", "Please enter {0}", "กรุณากรอก{0}", "{0} ထည့်ပါ", "Please enter", "กรุณากรอก", "ထည့်ပါ"},
            {"请填写", "Please enter {0}", "กรุณากรอก{0}", "{0} ဖြည့်ပါ", "Please enter", "กรุณากรอก", "ဖြည့်ပါ"},
            {"请上传", "Please upload {0}", "กรุณาอัปโหลด{0}", "{0} တင်ပါ", "Please upload", "กรุณาอัปโหลด", "တင်ပါ"},
    };

    static {
        loadLang("en", "i18n/admin-messages-en.json");
        loadLang("th", "i18n/admin-messages-th.json");
        loadLang("my", "i18n/admin-messages-my.json");
    }

    private static void loadLang(String lang, String path) {
        try (InputStream in = I18nMessageUtil.class.getClassLoader().getResourceAsStream(path)) {
            if (in == null) {
                LOGGER.warn("i18n file not found: {}", path);
                return;
            }
            String json = IoUtil.read(in, StandardCharsets.UTF_8);
            JSONObject obj = JSON.parseObject(json);
            Map<String, String> map = new LinkedHashMap<>();
            List<Tpl> tpls = new ArrayList<>();
            if (obj != null) {
                for (String key : obj.keySet()) {
                    String val = obj.getString(key);
                    map.put(key, val);
                    if (key.contains("{}") && StrUtil.isNotBlank(val) && !CJK.matcher(val).find()) {
                        tpls.add(new Tpl(toRegex(key), val));
                    }
                }
            }
            DICT.put(lang, map);
            TEMPLATES.put(lang, tpls);
        } catch (Exception e) {
            LOGGER.error("load i18n file failed: {}", path, e);
        }
    }

    private static Pattern toRegex(String template) {
        StringBuilder sb = new StringBuilder("^");
        int i = 0;
        while (i < template.length()) {
            if (i + 1 < template.length() && template.charAt(i) == '{' && template.charAt(i + 1) == '}') {
                sb.append("(.+?)");
                i += 2;
            } else {
                sb.append(Pattern.quote(String.valueOf(template.charAt(i))));
                i++;
            }
        }
        sb.append("$");
        return Pattern.compile(sb.toString());
    }

    public static boolean looksLikeToast(String text) {
        if (StrUtil.isBlank(text) || text.length() > 80) {
            return false;
        }
        return text.endsWith("成功") || text.endsWith("失败") || text.endsWith("不能为空")
                || text.startsWith("请选择") || text.startsWith("请输入") || text.startsWith("请填写")
                || text.contains("不存在") || text.contains("已存在") || text.contains("不正确");
    }

    public static String translate(String message) {
        if (StrUtil.isBlank(message) || !CJK.matcher(message).find()) {
            return message;
        }
        String lang = normalizeLang(RequestUtil.getLang());
        if ("zh-cn".equals(lang)) {
            return message;
        }
        int langIdx = "th".equals(lang) ? 1 : ("my".equals(lang) ? 2 : 0);

        for (String[] row : TOASTS) {
            if (row[0].equals(message)) {
                return row[langIdx + 1];
            }
        }

        Map<String, String> map = DICT.get(lang);
        if (map != null) {
            String hit = map.get(message);
            if (StrUtil.isNotBlank(hit) && !CJK.matcher(hit).find()) {
                return capitalize(hit, langIdx);
            }
        }
        List<Tpl> tpls = TEMPLATES.get(lang);
        if (tpls != null) {
            for (Tpl tpl : tpls) {
                Matcher matcher = tpl.pattern.matcher(message);
                if (matcher.matches()) {
                    Object[] args = new Object[matcher.groupCount()];
                    for (int i = 0; i < matcher.groupCount(); i++) {
                        args[i] = matcher.group(i + 1);
                    }
                    return StrUtil.format(tpl.target, args);
                }
            }
        }

        String crud = translateCrud(message, langIdx);
        if (crud != null) {
            return crud;
        }

        String headHit = translateHead(message, langIdx);
        if (headHit != null) {
            return headHit;
        }

        String scrubbed = replaceFragments(message, langIdx);
        if (StrUtil.isNotBlank(scrubbed) && !CJK.matcher(scrubbed).find()) {
            return capitalize(scrubbed, langIdx);
        }

        String prefixHit = translatePrefix(message, langIdx);
        if (prefixHit != null && (prefixHit.equals(message) || !CJK.matcher(prefixHit).find())) {
            return prefixHit;
        }

        String paramHit = translateRequestParam(message, langIdx);
        if (paramHit != null) {
            return paramHit;
        }

        String suffixHit = translateSuffix(message, langIdx);
        if (suffixHit != null && !CJK.matcher(suffixHit).find()) {
            return suffixHit;
        }
        return StrUtil.isNotBlank(scrubbed) ? capitalize(scrubbed, langIdx) : message;
    }

    private static String translateHead(String message, int langIdx) {
        for (String[] row : HEADS) {
            if (message.startsWith(row[0]) && message.length() > row[0].length()) {
                String rest = message.substring(row[0].length()).trim();
                String restTr = CJK.matcher(rest).find() ? translate(rest) : rest;
                return row[langIdx + 1] + restTr;
            }
        }
        return null;
    }

    public static Object translateData(Object data) {
        if (!(data instanceof String)) {
            return data;
        }
        String text = (String) data;
        if (!looksLikeToast(text)) {
            return data;
        }
        return translate(text);
    }

    /**
     * 操作日志展示用：接口描述、请求类型、错误消息。不用于请求体 JSON。
     */
    public static String translateLogText(String message) {
        if (StrUtil.isBlank(message) || !CJK.matcher(message).find()) {
            return message;
        }
        String lang = normalizeLang(RequestUtil.getLang());
        if ("zh-cn".equals(lang)) {
            return message;
        }
        int langIdx = "th".equals(lang) ? 1 : ("my".equals(lang) ? 2 : 0);
        for (String[] row : METHOD_TYPES) {
            if (row[0].equals(message)) {
                return row[langIdx + 1];
            }
        }
        String action = translateActionTitle(message, langIdx);
        if (action != null) {
            return action;
        }
        return translate(message);
    }

    private static String translateActionTitle(String message, int langIdx) {
        for (String[] verb : ACTION_VERBS) {
            String zh = verb[0];
            if (message.startsWith(zh)) {
                return fillAction(verb, message.substring(zh.length()), langIdx);
            }
        }
        for (String[] verb : ACTION_VERBS) {
            String zh = verb[0];
            if (message.endsWith(zh) && message.length() > zh.length()) {
                return fillAction(verb, message.substring(0, message.length() - zh.length()), langIdx);
            }
        }
        return null;
    }

    private static String fillAction(String[] verb, String subjectZh, int langIdx) {
        String subject = translateSubject(subjectZh.trim(), langIdx);
        String tpl = verb[langIdx + 1];
        String text = StrUtil.isBlank(subject) ? tpl.replace("{0}", "").trim() : StrUtil.format(tpl, subject);
        return langIdx == 0 ? capitalize(text, 0) : text;
    }

    private static String translateCrud(String message, int langIdx) {
        if (!message.endsWith("成功") && !message.endsWith("失败")) {
            return null;
        }
        boolean ok = message.endsWith("成功");
        String body = message.substring(0, message.length() - 2);

        for (String[] verb : VERBS) {
            String zh = verb[0];
            if (body.startsWith(zh)) {
                String subjectZh = body.substring(zh.length());
                return fillVerb(verb, subjectZh, ok, langIdx);
            }
        }
        for (String[] verb : VERBS) {
            String zh = verb[0];
            if (body.endsWith(zh)) {
                String subjectZh = body.substring(0, body.length() - zh.length());
                return fillVerb(verb, subjectZh, ok, langIdx);
            }
        }
        return null;
    }

    private static String fillVerb(String[] verb, String subjectZh, boolean ok, int langIdx) {
        String subject = translateSubject(subjectZh, langIdx);
        boolean empty = StrUtil.isBlank(subjectZh);
        String tpl;
        if (langIdx == 0) {
            tpl = empty ? (ok ? verb[3] : verb[4]) : (ok ? verb[1] : verb[2]);
        } else if (langIdx == 1) {
            tpl = empty ? (ok ? verb[7] : verb[8]) : (ok ? verb[5] : verb[6]);
        } else {
            tpl = empty ? (ok ? verb[11] : verb[12]) : (ok ? verb[9] : verb[10]);
        }
        String text = empty ? tpl : StrUtil.format(tpl, subject);
        return langIdx == 0 ? capitalize(text, 0) : text;
    }

    private static String translateSubject(String subjectZh, int langIdx) {
        if (StrUtil.isBlank(subjectZh)) {
            return "";
        }
        String out = replaceFragments(subjectZh, langIdx);
        return out.trim();
    }

    private static String replaceFragments(String message, int langIdx) {
        if (StrUtil.isBlank(message)) {
            return message;
        }
        String out = message;
        for (int n = 0; n < 8; n++) {
            String next = out;
            for (String[] row : SUBJECTS) {
                if (next.contains(row[0])) {
                    next = next.replace(row[0], row[langIdx + 1]);
                }
            }
            for (String[] row : FRAGMENTS) {
                if (next.contains(row[0])) {
                    next = next.replace(row[0], row[langIdx + 1]);
                }
            }
            if (next.equals(out)) {
                break;
            }
            out = next;
        }
        return out.replaceAll(" {2,}", " ").trim();
    }

    private static String translatePrefix(String message, int langIdx) {
        for (String[] row : PREFIXES) {
            if (!message.startsWith(row[0])) {
                continue;
            }
            String subjectZh = message.substring(row[0].length()).trim();
            boolean empty = StrUtil.isBlank(subjectZh);
            String tpl;
            if (langIdx == 0) {
                tpl = empty ? row[4] : row[1];
            } else if (langIdx == 1) {
                tpl = empty ? row[5] : row[2];
            } else {
                tpl = empty ? row[6] : row[3];
            }
            String text = empty ? tpl : StrUtil.format(tpl, translateSubject(subjectZh, langIdx));
            return langIdx == 0 ? capitalize(text, 0) : text;
        }
        return null;
    }

    private static String translateRequestParam(String message, int langIdx) {
        String prefix = "请求参数 ";
        String suffix = " 不能为空";
        if (message.startsWith(prefix) && message.endsWith(suffix)) {
            String name = message.substring(prefix.length(), message.length() - suffix.length());
            if (langIdx == 0) {
                return "Request parameter " + name + " cannot be empty";
            }
            if (langIdx == 1) {
                return "พารามิเตอร์ " + name + " ต้องไม่ว่าง";
            }
            return "ကန့်သတ်ချက် " + name + " မရှိ၍မရပါ";
        }
        if ("参数体不能为空".equals(message)) {
            return langIdx == 0 ? "Request body cannot be empty"
                    : (langIdx == 1 ? "เนื้อหาคำขอต้องไม่ว่าง" : "တောင်းဆိုချက် အကြောင်းအရာ မရှိ၍မရပါ");
        }
        if ("请求参数校验异常".equals(message)) {
            return langIdx == 0 ? "Request parameter validation failed"
                    : (langIdx == 1 ? "ตรวจสอบพารามิเตอร์ไม่ผ่าน" : "ကန့်သတ်ချက် စစ်ဆေးမှု မအောင်မြင်ပါ");
        }
        Matcher maxLen = Pattern.compile("最多(\\d+)个字符").matcher(message);
        if (maxLen.find() && message.endsWith("个字符")) {
            String n = maxLen.group(1);
            String head = message.substring(0, message.indexOf("最多"));
            String subject = translateSubject(head, langIdx);
            if (langIdx == 0) {
                return capitalize((StrUtil.isBlank(subject) ? "" : subject + " ") + "can be at most " + n + " characters", 0);
            }
            if (langIdx == 1) {
                return (StrUtil.isBlank(subject) ? "" : subject) + "ต้องไม่เกิน " + n + " ตัวอักษร";
            }
            return (StrUtil.isBlank(subject) ? "" : subject + " ") + "အများဆုံး စာလုံး " + n + " လုံး";
        }
        return null;
    }

    private static String translateSuffix(String message, int langIdx) {
        for (String[] row : SUFFIXES) {
            if (message.endsWith(row[0])) {
                String prefix = message.substring(0, message.length() - row[0].length());
                String prefixTr = translateSubject(prefix, langIdx);
                if (StrUtil.isBlank(prefix)) {
                    return capitalize(row[langIdx + 1].trim(), langIdx);
                }
                return capitalize((prefixTr + row[langIdx + 1]).trim(), langIdx);
            }
        }
        return null;
    }

    private static String capitalize(String text, int langIdx) {
        if (langIdx != 0 || StrUtil.isBlank(text)) {
            return text;
        }
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }

    private static String normalizeLang(String lang) {
        if (StrUtil.isBlank(lang)) {
            return "zh-cn";
        }
        String value = lang.toLowerCase().replace("_", "-");
        if (value.startsWith("zh")) {
            return "zh-cn";
        }
        if (value.startsWith("en")) {
            return "en";
        }
        if (value.startsWith("th")) {
            return "th";
        }
        if (value.startsWith("my") || value.startsWith("bur")) {
            return "my";
        }
        return value;
    }

    private static class Tpl {
        private final Pattern pattern;
        private final String target;

        private Tpl(Pattern pattern, String target) {
            this.pattern = pattern;
            this.target = target;
        }
    }
}

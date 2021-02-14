const {
    timer,
    admin,
    group,
    index,
    blackqq,
    whiteqq
} = require('./credentials');
const bot = require('./lib/bot');
const dayjs = require('dayjs');
const logger = require('./lib/logger');
const logger2 = require('./lib/logger2');
const CQcode = require("./lib/CQcode");
var start = false;
var userid = new Array();//存qq号
var user = new Array();//存群友回答的答案
//数字正则表达式 - miyaye - 博客园
//https://www.cnblogs.com/webskill/p/7422876.html
const a1 = /^\d+$/; //验证非负整数（正整数 + 0） 
const a2 = /^[Aa]+$|^[Bb]+$|^[Cc]+$|^[Dd]+$/;//验证是否为指定字母串
let timer2 = null;
let time = timer;
let index2 = index;
module.exports = async function () {
    send_group = (msg, group) => {
        return bot('send_group_msg', {
            group_id: group,
            message: msg
        });
    }
    send_private = (msg, private) => {
        return bot('send_private_msg', {
            user_id: private,
            message: msg
        });
    }
    getonline();
    action();
}

function getonline() {
    let t = new Date();
    return bot('get_status').then(data1 => {
        send_private("test", admin);
        logger2.info("test");
        return true;
    }).catch(err => {
        logger2.error(t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天") + err);
        return false;
    });
}

function action() {
    bot.on('message', context => {
        if (context.message_type == 'group') {
            if (context.user_id == admin) {
                if (context.message == "随机") {
                    bot('send_group_msg', { //send_group_msg
                        group_id: context.group_id,
                        message: '随机数:' + parseInt(Math.random() * 20)
                    }).then(data => {
                        logger2.info(JSON.stringify(data));
                    }).catch(err => {
                        logger2.error(JSON.stringify(err));
                    });
                } else if (context.message == "随机2") {
                    bot('send_group_msg', { //send_group_msg
                        group_id: context.group_id,
                        message: '随机数2:' + parseInt(20 + Math.random() * 5)
                    }).then(data => {
                        logger2.info(JSON.stringify(data));
                    }).catch(err => {
                        logger2.error(JSON.stringify(err));
                    });
                }
            }
        }
    });


    //计时器 固定时间，可选时间
    /*
    时间戳,昵称,qq号,答案
    */

    bot.on('message', context => {
        if (context.message_type == 'group' && context.group_id == group) {//只接受群消息和指定群
            if (start == true) {
                //logger2.info(JSON.stringify(context));
                logger2.info(new Date().getTime() + ";" + (context.sender.card == "" ? context.sender.nickname : context.sender.card) + ";" + context.sender.user_id + ";" + context.message.toString().toLowerCase())
                let temp = context.message.replace(/(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/g, ''); //过滤链接
                let i = 0;
                let qq = false;
                temp = temp.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF]/g, "");//过滤Emoji
                temp = temp.replace(/\[CQ:image.*?\]/g, "");//过滤图片
                temp = temp.trim();//清理头尾空格
                for (i = 0; i < blackqq.length; i++) {//排除黑名单的qq号
                    //console.log(context.user_id+","+blackqq[i]);
                    if (context.user_id == blackqq[i]) {
                        return false;
                    }
                }
                for (i = 0; i < whiteqq.length; i++) {//只允许白名单的qq号
                    console.log(context.user_id + "," + whiteqq[i]);
                    if (context.user_id == whiteqq[i]) {
                        qq = true;
                    }
                }
                if (temp == "" || qq == false) {
                    return false;
                }
                if (a2.test(context.message) == true) {
                    let temp2 = context.message.toString().toLowerCase();//全部转换为小写字母
                    logger2.info(new Date().getTime() + ";" + (context.sender.card == "" ? context.sender.nickname : context.sender.card) + ";" + context.user_id + ";" + temp2[0])//群昵称和qq名字
                    if (user[context.user_id] == null) {
                        userid.push(context.user_id);
                        user[context.user_id] = new Date().getTime() + ";" + (context.sender.card == "" ? context.sender.nickname : context.sender.card) + ";" + context.user_id + ";" + temp2[0];
                        bot('send_group_msg', { //send_group_msg
                            group_id: context.group_id,
                            message: CQcode.reply(context.message_id) + "记录答案" + temp2[0] + CQcode.at(context.user_id)//相同字母串只存第一个
                        }).then(data => {
                            logger2.info("1" + JSON.stringify(data));
                        }).catch(err => {
                            logger2.error("1" + JSON.stringify(err));
                        });
                    }
                    else {
                        user[context.user_id] = new Date().getTime() + ";" + (context.sender.card == "" ? context.sender.nickname : context.sender.card) + ";" + context.user_id + ";" + temp2[0];
                        bot('send_group_msg', { //send_group_msg
                            group_id: context.group_id,
                            message: CQcode.reply(context.message_id) + "更新答案" + temp2[0] + CQcode.at(context.user_id)
                        }).then(data => {
                            logger2.info("2" + JSON.stringify(data));
                        }).catch(err => {
                            logger2.error("2" + JSON.stringify(err));
                        });
                    }
                }
                /*else {
                    bot('send_group_msg', { //send_group_msg
                        group_id: context.group_id,
                        message: CQcode.reply(context.message_id) + "答案不是单字母或同一字母串(a,b,c,d/Aaa,Bbb,ccCc,ddDdddd)" + CQcode.at(context.user_id)
                    }).then(data => {
                        logger2.info(JSON.stringify(data));
                    }).catch(err => {
                        logger2.error(JSON.stringify(err));
                    });
                }*/
            }
            if (context.user_id == admin) {
                if ((context.message.search(/^计时$/) != -1 || context.message.search(/^计时\d+$/) != -1) && start == false) {
                    let temp = CQcode.unescape(context.message).replace(/\\\//g, "/").split("计时");
                    //logger.info(temp);
                    //logger.info(temp.length);
                    if (temp.length != 2 || a1.exec(temp[1]) == null) {
                        temp = timer;
                    }
                    else {
                        temp = parseInt(temp[1]);
                        time = parseInt(temp[1]);
                    }
                    logger2.info('计时');
                    start = true;
                    bot('send_group_msg', { //send_group_msg
                        group_id: context.group_id,
                        message: '开始计时:' + temp + "秒\n" + `[CQ:image,file=file:///${__dirname}/pic/1.jpg]`
                    }).then(data => {
                        timer2 = setInterval(() => {
                            time--;
                            switch (time) {
                                case 30:
                                    bot('send_group_msg', { //send_group_msg
                                        group_id: context.group_id,
                                        message: '还剩:' + time + "秒"
                                    }).then(data => {
                                        logger2.info(JSON.stringify(data));
                                    }).catch(err => {
                                        logger2.error(JSON.stringify(err));
                                    });
                                    break;
                                case 10:
                                    bot('send_group_msg', { //send_group_msg
                                        group_id: context.group_id,
                                        message: '还剩:' + time + "秒"
                                    }).then(data => {
                                        logger2.info(JSON.stringify(data));
                                    }).catch(err => {
                                        logger2.error(JSON.stringify(err));
                                    });
                                    break;
                            }
                        }, 1000);
                        logger.info("start;" + "");//尝试转成csv格式
                        //logger.info(new Date().getTime() + ";" + "start" + index2);//尝试转成csv格式
                        logger2.info(JSON.stringify(data));
                        let t = setTimeout(() => {
                            clearTimeout(t);
                            bot('send_group_msg', { //send_group_msg
                                group_id: context.group_id,
                                message: '结束计时:' + temp + "秒" + `[CQ:image,file=file:///${__dirname}/pic/2.jpg]`
                            }).then(data => {
                                start = false;
                                clearInterval(timer2);
                                timer2 = null;
                                time = timer;
                                let s = "";
                                for (let i = 0; i < userid.length; i++) {
                                    s += user[userid[i]] + "\n";
                                    logger.info(user[userid[i]]);//尝试转成csv格式
                                }
                                bot('send_group_msg', { //send_group_msg
                                    group_id: context.group_id,
                                    message: index2 + "答题记录到的结果有:\n" + s
                                }).then(data => {
                                    logger2.info(JSON.stringify(data));
                                }).catch(err => {
                                    logger2.error(JSON.stringify(err));
                                });
                                userid = null;
                                userid = new Array();
                                user = null;
                                user = new Array();
                                //logger.info(new Date().getTime() + ";" + "end" + index2);//尝试转成csv格式
                                logger.info("end;" + "");//尝试转成csv格式
                                index2++;
                                logger2.info(JSON.stringify(data));
                            }).catch(err => {
                                logger2.error(JSON.stringify(err));
                            });
                            t = null;
                        }, parseInt(temp * 1000));
                    }).catch(err => {
                        let t = new Date();
                        logger2.info('计时' + dayjs(t.toString()).format(' A 星期d'));
                        logger2.error(JSON.stringify(err));
                    });
                }
            }
        }
    });
}


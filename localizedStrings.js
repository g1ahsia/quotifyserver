
var notificationMessage = new Object();
var message0 = new Object();
var message1 = new Object();
var message2 = new Object();
var message3 = new Object();
var message4 = new Object();
var message5 = new Object();
var message6 = new Object();
var message7 = new Object();
var message8 = new Object();

notificationMessage[0] = message0;
notificationMessage[1] = message1;
notificationMessage[2] = message2;
notificationMessage[3] = message3;
notificationMessage[4] = message4;
notificationMessage[5] = message5;
notificationMessage[6] = message6;
notificationMessage[7] = message7;
notificationMessage[8] = message8;

message0['en'] = 'liked your quote';
message0['zh-Hant'] = '喜歡您的引言';

message1['en'] = 'requoted your quote';
message1['zh-Hant'] = '引用您的引言';

message2['en'] = 'started following you';
message2['zh-Hant'] = '開始關注您';

message3['en'] = 'started following your collection';
message3['zh-Hant'] = '開始關注您的收藏夾';

message4['en'] = 'commented on your quote';
message4['zh-Hant'] = '針對您的引言留言';

message5['en'] = 'added a new quote';
message5['zh-Hant'] = '加入一個引言';

message6['en'] = 'created a new collection';
message6['zh-Hant'] = '建立了一個新的收藏夾';

message7['en'] = 'sent you a message';
message7['zh-Hant'] = '留了言給您';

message8['en'] = 'Daily inspiration for you';
message8['zh-Hant'] = '為您挑選的每日佳言';

var toCollection = new Object();

toCollection['en'] = 'to collection';
toCollection['zh-Hant'] = '至收藏夾';


console.log(notificationMessage[0]['zh-Hant']);

exports.notificationMessage = notificationMessage;
exports.toCollection = toCollection;
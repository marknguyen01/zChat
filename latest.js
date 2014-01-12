var connected = false;
var toflag = true;
var oldmsg = '';
var refreshtime = '8000';
var chatboxurl = '/h15-';
var permission = '-1';
var zchat = {
	lang: {
		permission_error: 'You don\'t have permission to use that command',
		user_error: 'This user does not exist',
		syntax_error: 'Wrong syntax',
		console_message: 'Console started',
		clear_message: 'You have cleared the chatbox messages',
		clear_notify: 'cleared the chatbox messages',
		ban_message: 'You have successfully banned',
		ban_notify: 'banned',
		ban_error: 'You cannot ban this user or this user is not online',
		kick_message: 'You have successfully kicked',
		kick_notify: 'kicked',
		kick_error: 'You cannot kick this user or this user is not online',
		changelog_message: 'None',
		help_message: '/cclear - Clear the console history<br>/help - List of known commands<br>/changelog -  List of new added features<br>/report - Report a member<br>/log - Show chatbox history<br>/friend <username> - Add a user as friends<br>/foe <username> - Add a user as foe<br>/avatar <username> - Get that user\'s avatar',
		report_open_message: 'Report opened',
		report_close_message: 'Report closed'
	},
	name: 0,
	tid: 0,
	prepare: function () {
		if (document.getElementById('logout')) {
			var a = document.getElementById('logout');
			zchat.tid = a.href.substring(a.href.indexOf('tid=') + 4, a.href.indexOf('&key'));
			zchat.name = a.textContent.replace(/Logout |Thoát /, '').replace('[ ', '');
			zchat.name = zchat.name.substring(0, zchat.name.lastIndexOf(' ]'));
		}
	},
	togglechatlogin: function () {
		if (connected) {
			connected = false;
			zchat.connect('disconnect');
		} else {
			connected = true;
			zchat.connect('connect');
		}
	},
	returnUser: function (name) {
		document.cpost.message.value += name;
		document.cpost.message.focus();
	},
	connect: function (type) {
		if (window.XMLHttpRequest) {
			var http_request = new XMLHttpRequest();
		} else if (window.ActiveXObject) {
			var http_request = new ActiveXObject("Microsoft.XMLHTTP");
		}
		http_request.onreadystatechange = function () {
			if (http_request.readyState == 4 && http_request.status == 200) {
				zchat.refresh_chatbox();
				window.setTimeout("document.getElementById('c_box').scrollTop=999999", 1000);
			}
		};
		http_request.open('GET', '/chatbox/chatbox_actions.forum?archives=1&mode=' + type + '&tid=' + zchat.tid, true);
		http_request.send(null);
	},
	ctheme: function (theme) {
		my_setcookie('ctheme', theme, true);
		document.getElementById(theme).checked = 'checked';
		document.getElementById('zchat').className = theme;
		document.getElementById('c_box').scrollTop = 999999;
		document.cpost.message.focus();
	},
	initchat: function () {
		zchat.init_pref();
		var theme = my_getcookie('ctheme');
		if (theme == null) {
			theme = 'h13';
		}
		zchat.togglechatlogin();
		zchat.ctheme(theme);
	},
	init_pref: function () {
		if (my_getcookie('CB_bold') == 1) {
			document.cpost.sbold.value = 1;
			document.getElementById('divbold').setAttribute('checked', 'checked');
			document.cpost.message.style.fontWeight = 'bold';
		}
		if (my_getcookie('CB_italic') == 1) {
			document.cpost.sitalic.value = 1;
			document.getElementById('divitalic').setAttribute('checked', 'checked');
			document.cpost.message.style.fontStyle = 'italic';
		}
		if (my_getcookie('CB_under') == 1) {
			document.cpost.sunderline.value = 1;
			document.getElementById('divunderline').setAttribute('checked', 'checked');
			document.cpost.message.style.textDecoration = 'underline';
		}
		if (my_getcookie('CB_strike') == 1) {
			document.cpost.sstrike.value = 1;
			document.getElementById('divstrike').setAttribute('checked', 'checked');
			document.cpost.message.style.textDecoration = ' line-through'
		}
		if (pref = my_getcookie('CB_color')) {
			document.cpost.scolor.value = pref;
			document.getElementById('show_color').style.backgroundColor = '#' + pref;
			document.cpost.message.style.color = '#' + pref;
		}
		zchat.initcolorbox();
	},
	submitmsg: function () {
		var x = document.cpost.message.value;
		var y = x.toLowerCase();
		//   if (y.indexOf('/exit') == 0) {x=x.replace(/\//,'&#47;');}
		if (y.indexOf('/') == 0) {
			x = x.replace(/\//, '&#47;');
		}
		document.cpost.sent.value = x;
		document.cpost.message.value = '';
		document.cpost.message.focus();
		zchat.submit_chatbox();
		return false;
	},
	ddajax: function (flag, sent) {
		if (window.XMLHttpRequest) {
			var http_request = new XMLHttpRequest()
		} else if (window.ActiveXObject) {
			var http_request = new ActiveXObject("Microsoft.XMLHTTP")
		}
		http_request.onreadystatechange = function () {
			if (http_request.readyState == 4 && http_request.status == 200) {
				var response = http_request.responseText;
				if (flag == 'refresh' && response.substring(0, 3) != 'var') {
					oldmsg = response;
					zchat.connect('connect');
				} else if (response != oldmsg) {
					oldmsg = response;
					eval(response);
					doc = document.implementation.createHTMLDocument("example");
					doc.documentElement.innerHTML = chatbox_messages;
					loop = doc.getElementsByClassName('user-msg');
					for (i = 0; i < loop.length; i++) {
						if (loop[i].getElementsByClassName('user')[0].getElementsByTagName('a')[0]) {
							loop[i].getElementsByClassName('user')[0].getElementsByTagName('a')[0].setAttribute('onclick', 'zchat.returnUser(this.textContent); return false');
							loop[i].getElementsByClassName('user')[0].innerHTML = loop[i].getElementsByClassName('user')[0].innerHTML.replace(/@/, '[MOD]');
							loop[i].getElementsByTagName('a')[0]
						} else {
							loop[i].getElementsByClassName('msg')[0].innerHTML = loop[i].getElementsByClassName('msg')[0].innerHTML.replace('<strong>* ', '<strong>');
						}
					}
					document.getElementById('c_box').innerHTML = doc.documentElement.innerHTML;
					chatbox_memberlist = chatbox_memberlist.replace(/li\>\<li/g, 'li>, <li').replace(/<[^>]+>/g, '');
					chatbox_memberlist = chatbox_memberlist.replace(/Online/, '<b>Online: </b>').replace(/Away/, ', ');
					chatbox_memberlist = chatbox_memberlist.replace(/@&nbsp;/g, '[MOD] ');
					document.getElementById('c_users').innerHTML = '<div id="chatterlist">' + chatbox_memberlist + '</div>';
					document.getElementById('c_box').scrollTop = 999999;
					//            document.cpost.message.focus();
					toflag = window.setTimeout('zchat.refresh_chatbox()', refreshtime);
				}
			}
		};
		if (flag == 'refresh') {
			http_request.open('GET', '/chatbox/chatbox_actions.forum?archives=1&mode=refresh', true);
			http_request.send(null);
		} else {
			http_request.open('POST', '/chatbox/chatbox_actions.forum?archives=1', true);
			http_request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;');
			http_request.send(flag + '&sent=' + encodeURIComponent(sent));
		}
	},
	submit_chatbox: function () {
		var toflag = window.clearTimeout(toflag);
		var msg_sent = document.cpost.sent.value;
		var data = '&mode=send';
		// data += '&sent=' + msg_sent;
		data += '&sbold=' + document.cpost.sbold.value;
		data += '&sitalic=' + document.cpost.sitalic.value;
		data += '&sunderline=' + document.cpost.sunderline.value;
		data += '&sstrike=' + document.cpost.sstrike.value;
		data += '&scolor=' + document.cpost.scolor.value;
		zchat.command(msg_sent.replace(/&#47;/g, '/'), data);
	},
	report: function () {
		var suspect = document.getElementById('suspect').value,
			reason = document.getElementById('reason').value,
			report = document.getElementById('c_box').innerHTML.replace(/<p.*?>(.*?)<\/p>/g, '\n$1').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
		document.report.message.value = 'Hello {USERNAME}, ' + uname + ' has reported ' + suspect + ' for ' + reason + '. Here is the chat log\n' + report + '\nReported via zChat';
	},
	submitReport: function () {
		$.post('/contact?action=submit', $("#c_report form").serialize());
	},
	command: function (value, data) {
		if (value == '/cls' || value == '/clear') {
			zchat.showCommand('<br><b>> /clear</b><br>');
			if (zchat.checkUser('\\[MOD\\]\\s' + zchat.name)) {
				zchat.ddajax(data, '/cls');
				zchat.ddajax(data, '/me ' + zchat.lang.clear_notify);
				zchat.showCommand(zchat.clear_message);
			} else {
				zchat.showCommand(zchat.permission_error);
			}
		} else if (value.indexOf('/ban ') === 0) {
			var name = value.substring(value.indexOf(' ') + 1);
			zchat.showCommand('<br><b>> /ban ' + name + '</b><br>');
			if (zchat.checkUser('\\[MOD\\]\\s+' + zchat.name) && zchat.checkUser(name)) {
				zchat.ddajax(data, '/ban ' + name);
				zchat.ddajax(data, '/me ' + zchat.lang.ban_notify + ' ' + name);
				zchat.showCommand(zchat.lang.ban_message + ' ' + name);
			} else {
				if (zchat.checkUser('\\[MOD\\]\\s+' + zchat.name)) {
					zchat.showCommand(zchat.lang.ban_error);
				} else {
					zchat.showCommand(zchat.lang.permission_error);
				}
			}
		} else if (value.indexOf('/kick ') === 0) {
			var name = value.substring(value.indexOf(' ') + 1);
			zchat.showCommand('<br><b>> /kick ' + name + '</b><br>');
			if (zchat.checkUser('\\[MOD\\]\\s+' + zchat.name) && zchat.checkUser(name)) {
				zchat.ddajax(data, '/kick ' + name);
				zchat.ddajax(data, '/me ' + zchat.lang.kick_notify + ' ' + name);
				zchat.showCommand(zchat.lang.kick_message + ' ' + name);
			} else {
				if (zchat.checkUser('\\[MOD\\]\\s+' + zchat.name)) {
					zchat.showCommand(zchat.lang.permission_error);
				} else {
					zchat.showCommand(zchat.lang.kick_error);
				}
			}
		} else if (value == '/console') {
			var a = document.getElementById('c_console'),
				b = document.getElementById('c_box'),
				c = document.getElementById('c_right');
			a.style.display == 'none' ? (a.style.display = 'block', $('#c_console_inner').append('<br><b>> /console</b><br>' + zchat.lang.console_message)) : a.style.display = 'none';
			if (b.getAttribute('style') && document.getElementById('c_report').style.display == 'none') {
				b.removeAttribute('style');
				c.setAttribute('style', 'display: none');
			} else {
				b.setAttribute('style', 'right:255px');
				c.setAttribute('style', 'display: block');
			}
			return false;
		} else if (value == '/changelog') {
			zchat.showCommand('<br><b>> /changelog</b><br>' + zchat.lang.changelog_message);
			return false;
		} else if (value == '/help') {
			zchat.showCommand('<br><b>> /help</b><br>' + zchat.lang.help_message);
			return false;
		} else if (value == '/cclear') {
			$("#c_console_inner").html('');
			return false;
		} else if (value == '/log') {
			zchat.showCommand('<br><b>> /log</b><br><textarea style="width:100%;resize:none" onclick="this.select()" readonly="readonly">' + document.getElementById('c_box').innerHTML + '</textarea>');
			return false;
		} else if (value == '/report') {
			var a = document.getElementById('c_report'),
				b = document.getElementById('c_box'),
				c = document.getElementById('c_right');
			a.style.display == 'none' ? (a.style.display = 'block', zchat.showCommand('<br><b>> /report</b><br>' + zchat.lang.report_open_message)) : (a.style.display = 'none', zchat.showCommand('<br><b>> /report</b><br>' + zchat.lang.report_close_message));
			if (b.getAttribute('style') && document.getElementById('c_console').style.display == 'none') {
				b.removeAttribute('style');
				c.setAttribute('style', 'display: none');
			} else {
				b.setAttribute('style', 'right:255px');
				c.setAttribute('style', 'display: block');
			}
			return false;
		} else if (value.indexOf('/friend ') === 0) {
			$.post("/profile?mode=editprofile&page_profil=friendsfoes", {
				'friend': value.substring(value.indexOf(' ') + 1)
			}, function (data) {
				var notice = $(data).find(".frm-set:first dd:last span").text();
				notice = notice == '' ? zchat.lang.syntax_error : notice;
				zchat.showCommand('<br><b>> /friend ' + value.substring(value.indexOf(' ') + 1) + '</b><br>' + notice);
			});
			return false;
		} else if (value.indexOf('/foe ') === 0) {
			$.post("/profile?mode=editprofile&page_profil=friendsfoes", {
				'foe': value.substring(value.indexOf(' ') + 1)
			}, function (data) {
				var notice = $(data).find(".frm-set:last dd:last span").text();
				notice = notice == '' ? zchat.lang.syntax_error : notice;
				zchat.showCommand('<br><b>> /foe ' + value.substring(value.indexOf(' ') + 1) + '</b><br>' + notice);
			});
			return false;
		} else if (value.indexOf('/avatar ') === 0) {
			var avatar = value.substring(value.indexOf(' ') + 1);
			$("<div />").load("/profile.forum?mode=viewprofile&u=" + avatar.replace(/ /g, '+') + " #profile-advanced-right .module:first .main-content img:first", function () {
				if (this.getElementsByTagName('img').length != 1) {
					notice = zchat.lang.user_error;
				} else {
					notice = '<img src="' + this.getElementsByTagName('img')[0].getAttribute('src') + '" />';
				}
				zchat.showCommand('<br><b>> /avatar ' + avatar + '</b><br>' + notice);
			});
			return false;
		} else {
			zchat.ddajax(data, document.cpost.sent.value)
		}
	},
	showCommand: function (data) {
		if (document.getElementById('c_right').style.display == 'block' && document.getElementById('c_console').style.display == 'block') {
			$("#c_console_inner").append(data)
		}
	},
	checkUser: function (user) {
		var regex = new RegExp('\\s' + user, 'g');
		a = document.getElementById('c_users').textContent.replace('Online: ', '');
		return regex.test(a);
	},
	refresh_chatbox: function () {
		toflag = window.clearTimeout(toflag);
		if (connected) {
			zchat.ddajax('refresh');
		}
	},
	do_style: function (dostyle, elem) {
		switch (dostyle) {
		case 'bold':
			{
				document.getElementById('divbold').style.fontWeight = (document.cpost.sbold.value == '0') ? 'bold' : '';
				document.cpost.message.style.fontWeight = document.getElementById('divbold').style.fontWeight;
				document.cpost.sbold.value = (document.cpost.sbold.value == '0') ? '1' : '0';
				my_setcookie('CB_bold', document.cpost.sbold.value);
				break;
			}
		case 'italic':
			{
				document.getElementById('divitalic').style.fontStyle = (document.cpost.sitalic.value == '0') ? 'italic' : '';
				document.cpost.message.style.fontStyle = document.getElementById('divitalic').style.fontStyle;
				document.cpost.sitalic.value = (document.cpost.sitalic.value == '0') ? '1' : '0';
				my_setcookie('CB_italic', document.cpost.sitalic.value);
				break;
			}
		case 'underline':
			{
				document.getElementById('divunderline').style.textDecoration = (document.cpost.sunderline.value == '0') ? document.cpost.message.style.textDecoration + ' underline' : document.cpost.message.style.textDecoration.replace('underline', '');
				document.cpost.message.style.textDecoration = document.getElementById('divunderline').style.textDecoration;
				document.cpost.sunderline.value = (document.cpost.sunderline.value == '0') ? '1' : '0';
				my_setcookie('CB_under', document.cpost.sunderline.value);
				break;
			}
		case 'strike':
			{
				document.getElementById('divstrike').style.textDecoration = (document.cpost.sstrike.value == '0') ? document.cpost.message.style.textDecoration + ' line-through' : document.cpost.message.style.textDecoration.replace('line-through', '');
				document.cpost.message.style.textDecoration = document.getElementById('divstrike').style.textDecoration;
				document.cpost.sstrike.value = (document.cpost.sstrike.value == '0') ? '1' : '0';
				my_setcookie('CB_strike', document.cpost.sstrike.value);
				break;
			}
		}
		document.cpost.message.focus();
	},
	setcbcol: function (color) {
		document.getElementById('show_color').style.backgroundColor = '#' + color;
		document.getElementById('scolor').value = color;
		document.getElementById('zchat-message').style.color = '#' + color;
		my_setcookie('CB_color', color);
		document.getElementById('zchat-color').style.display = 'none';
		document.cpost.message.focus();
	},
	popup: function (a, b) {
		document.cpost.message.focus();
		$('#' + a).siblings().hide();
		x = document.getElementById(a);
		if (x.style.display == 'none') {
			position = b.offsetX === undefined ? b.layerX : b.offsetX;
			x.setAttribute('style', 'display: block;left: ' + position + 'px');
		} else {
			x.style.display = 'none';
		}
	},
	loadsmilies: function (a) {
		zchat.popup('zchat-smilies', a);
		var x = document.getElementById('zchat-smilies');
		if (x.innerHTML == '') {
			$(x).load('/smilies.forum?mode=smilies_frame #smilies_categ, .smiley-element', function () {
				this.innerHTML = this.innerHTML.replace(/alt=\"(.*?)\"/g, 'onclick="zchat.insertsmiley(\'$1\')"');
			});
		}
	},
	insertsmiley: function (smiley) {
		document.cpost.message.value += ' ' + smiley + ' ';
		document.getElementById('zchat-smilies').style.display = 'none';
		document.cpost.message.focus();
	},
	initcolorbox: function () {
		var x = '<table cellspacing="0" id="ddcbcolors">';
		var colors = new Array('00', '33', '66', '99', 'CC', 'FF');
		for (i = 5; i >= 0; i--) {
			x = x + '<tr>';
			for (j = 5; j >= 0; j--) {
				for (k = 5; k >= 0; k--) {
					var col = colors[j] + colors[i] + colors[k];
					x = x + '<td style="background: #' + col + '" onclick="zchat.setcolor(\'' + col + '\');"></td>';
				}
			}
			x = x + '</tr>';
		}
		document.getElementById('zchat-color').innerHTML = x + '</table>';
	},
	setcolor: function (col) {
		var bbopen = '[color=#' + col + ']';
		var bbclose = '[/color]';
		zchat.setcbcol(col);
	},
	initchatbox: function () {
		var x = document.getElementById('main-content');
		$.get(chatboxurl, function (a) {
			$(x).append('<div id="zchat">' + a + '</div>');
			zchat.initchat()
		})
	},
};
$(function () {
	zchat.prepare();
	zchat.initchatbox();
});
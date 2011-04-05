﻿	function fillLabyrinth1(l){
		$("#tdField" + l).append("<table id = 'table_field" + l + "' style = 'border-width:0px; border-spacing: 0px'>")
		for (var i = 0; i < curMap[l].length; ++i){
			$("#table_field" + l).append("<tr id = 'tr_field" + (l * 1000 + i) + "'>");
			for (var j = 0; j < curMap[l][i].length; ++j){
				switch(curMap[l][i][j] ){					
				case "#":						
					$("#tr_field" + (l * 1000 + i)).append("<td class = 'wall' id = '"+(l * 10000 + i * 100 + j)+"'>");						
					break;					
				case "#_":						
					$("#tr_field" + (l * 1000 + i)).append("<td class = 'wall' id = '"+(l * 10000 + i * 100 + j)+"'>");						
					$('#' + (l * 10000 + i * 100 + j)).append('<div class = "lock"></div>');						
					break;					
				case "._":						
					$("#tr_field" + (l * 1000 + i)).append("<td class = 'floor' id = '"+(l * 10000 + i * 100 + j)+"'>");						
					$('#' + (l * 10000 + i * 100 + j)).append('<div class = "key"></div>');						
					break;					
				default:						
					$("#tr_field" + (l * 1000 + i)).append("<td class = 'floor' id = '"+(l * 10000 + i * 100 + j)+"'>");				
				}
                if (curMap[l][i][j] == "R" || curMap[l][i][j] == "L" || curMap[l][i][j] == "U" || curMap[l][i][j] == "D"){
					startDir[l] = dirs[curMap[l][i][j]];
					startX[l] = j;
					startY[l] = i;
				}
				for (var k = 0; k < specSymbols[l].list.length; ++k){
					if (curMap[l][i][j] == specSymbols[l].list[k]){
						specSymbols[l].coord.x.push(j);
						specSymbols[l].coord.y.push(i);
						specSymbols[l].style.push(specSymbols[l].style_list[k]);
						specSymbols[l].cur_count[k] = 0;
						specSymbols[l].symb.push(specSymbols[l].list[k]);
						break;
					}
				}
				$("#tr_field" + (l * 1000 + i)).append("</td>");
			}
			$("#table_field" + l).append("</tr>");
		}
		$("#tdField" + l).append("</table>");
	}
	function chooseUser(){
		var user = $("input:checked");
		$("#ui-tabs-0").empty();
		$("#ui-tabs-0").append('<p>Текущий пользователь:</p>');
		name = user[0].defaultValue;
		for (var i = 0; i < users.login.length; ++i){
			if (name == users.name[i])
				login = users.login[i];
		}
		$("#ui-tabs-0").append('<p>' + user[0].defaultValue +'</p>');
		$("#ui-tabs-0").append('<input type = "button" name="changeUser" id = "changeUser" class = "changeUser" onClick = changeUser()></input>');
		if (atHome){
			login = 'apress';
			passwd = 'tratata';
		}
		callScript(pathPref + 'f=login;login=' + login + ';passwd=' + passwd +';json=1;', function(data){
			if (data.status == "ok")
				sid = data.sid;
			else
				alert("Ошибка подключения к серверу. Попробуйте снова");
		});
	}
	function changeUser(){
		callScript(pathPref +'f=users;sid=' + sid + ';cid=' + cid + ';rows=100;json=1;', function(data){
				if (!data)
					return;
				login = undefined;
    			users.login = [];
				users.name = [];
				for (var i = 0; i < data.length; ++i){
					if (data[i].ooc == 1)
						continue;
					users.login.push(data[i].login);
					users.name.push(data[i].name);
				}
				$("#ui-tabs-0").empty();
				if (users.login.length > 0){
					$("#ui-tabs-0").append('<p>Выберите свое имя из списка</p>');
					$("#ui-tabs-0").append('<form name = "userList" id = "userList">');
					for (var i = 0; i < users.login.length; ++i)
						$("#userList").append('<input type="radio" name="user_name" id="user_name_' + i + '" value="' + users.name[i] + '" ' + (i == 0 ? 'checked': '') + ' class="radioinput" /><label for="user_name_' + i + '">' + users.name[i] + '</label><br>');
					$("#userList").append('<input type = "button" name="userNameSubmit" id = "userNameSubmit" class = "userNameSubmit" onClick = chooseUser()></input>');
					$("#ui-tabs-0").append('</form>');
				}
				else 
					$("#ui-tabs-0").append('<p>На данный момент нет доступных пользователей</p>');	
			});
	}
	submitClick = function(){
		if (atHome){
			login = 'apress';
			passwd = 'tratata';		
			callScript(pathPref + 'f=login;login=' + login + ';passwd=' + passwd +';json=1;', function(data){
				if (data.status == "ok")
					sid = data.sid;
				else
					alert("Ошибка подключения к серверу. Попробуйте снова");
			});
			var result = "";
			var arr = $("#sortable" + curProblem).sortable("toArray");
			for (var i = 0; i < arr.length - 1; ++i){
				var c = parseInt($('#' + arr[i] + ' input')[0].value);
				result += arr[i].replace(/\d{1,}/, "") + " " + c + " ";
			}
			submitStr = 'source=' + result + '&problem_id=771346&de_id=772264';
			callSubmit_('imcs.dvgu.ru', '/cats/main.pl?f=problems;sid=' + sid + ';cid=' + cid +';', submitStr, function(data){
				alert(data);
			});  
		} 
		else {
			if (!login) {
				alert('Невозможно отослать решение, так как не выбран пользователь');
				return false;
			}
			callScript(pathPref + 'f=login;login=' + login + ';passwd=' + passwd +';json=1;', function(data){
				if (!data)
					return;
				if (data.status == "ok")
					sid = data.sid;
				else
					alert("Ошибка подключения к серверу. Попробуйте снова");
			});
			var result = "";
			var arr = $("#sortable" + curProblem).sortable("toArray");
			for (var i = 0; i < arr.length - 1; ++i){
				var c = parseInt($('#' + arr[i] + ' input')[0].value);
				result += arr[i].replace(/\d{1,}/, "") + " " + c + " ";
			}
			var problem_id = problemsList[curProblem].id;  //problem_id = 
			var de_id = 772264;
			var boundary = Math.round((Math.random() * 999999999999));
			var sep = "-------------" + boundary + "\r\n";
			var l = 0;
			function genPostQuery(serv, path, data)	{
				var result = "Content-Type: multipart/form-data, boundary=" + sep + "\r\n";
				result += "Content-Length: " + data.length + "\r\n\r\n";
				l = data.length;
				result += data;
				return result;
			}
			function genFieldData(name, value){
				var result = sep + 'Content-Disposition: form-data; name="' + name + '"' + "\r\n\r\n";
				result += value + "\r\n";
				return result;
			}
			function genFileFieldData(name, filename, type, data){
				var result = sep + 'Content-Disposition: form-data; name="' + name  +  '"; filename="' + filename + '"' + "\r\n";
				result += 'Content-Type: ' + type + "\r\n\r\n";
				result += data + "\r\n\r\n";
				return result;
			}
			var data = genFieldData("search", "");
			data += genFieldData("rows", "20");
			data += genFieldData("problem_id", problem_id);
			data += genFieldData("de_id", de_id);
			data += genFieldData("submit", "send");
			data += genFileFieldData("source", "ans.txt", "text/plain", result);
			data += "-------------" + boundary  + "--\r\n";
			var query = genPostQuery('imcs.dvgu.ru', '/cats/main.pl?f=problems;sid=' + sid + ';cid=' + cid, data);
			callSubmit(pathPref + 'f=problems;sid=' + sid + ';cid=' + cid, data,'imcs.dvgu.ru', '/cats/main.pl?f=problems;sid=' + sid + ';cid=' + cid, sep, l, function(data){
				alert('Решение отослано на проверку');
			});
		}
	}
	function fillTabs(){
		if (!login)  {
			callScript(pathPref + 'f=login;login=' + 'apress' +';passwd=' + 'tratata' + ';json=1;', function(data){
			if (!data)
				return;
			if (data.status == "ok")
				sid = data.sid;
			else {
				sid = undefined;
				alert("Ошибка подключения к серверу. Попробуйте снова");
			}
			});
		}
		else
			callScript(pathPref + 'f=login;login=' + login +';passwd=' + passwd + ';json=1;', function(data){
				if (data.status == "ok")
					sid = data.sid;
				else {
					sid = undefined;
					alert("Ошибка подключения к серверу. Попробуйте снова");
				}
			});
		callScript(pathPref + 'f=contests;filter=current;json=1;', function(data){
			if (!data)
				return;
			var contests = data.contests;
			for (var i = 0; i < data.length; ++i){
				if(contests[i].is_official)
					cid = contests[i].id;
			}
		 });
		if (atHome)
			cid = 577647;
		$("#tabs").tabs("add", "#ui-tabs-0", "Выбор пользователя" );
		changeUser();
		callScript(pathPref + 'f=problems;sid='+sid+';cid='+cid+';json=1;', function(data){
			for (var i = 0; i < 9/*data.problems.length*/; ++i){
			    getProblemStatement(i);
				getTest(i, 1);
				if (data)					///////
					problemsList.push({"id":data.problems[i].id, "name": data.problems[i].name});
				$("#tabs").tabs("add", "#ui-tabs-" + (i + 1), problems[i].name );
				$("#ui-tabs-" + (i + 1)).append('<table id = "main' + i + '">');
				mainT = $("#main" + i);
				mainT.append('<tr id = "1tr' + i +'">');
				$("#1tr" + i).append('<td colspan = "' + (problems[i].max_step ? 2 : 3) +'" id = "tdSt' + i + '" valign = "top">');
				$("#1tr" + i).append('</td>');
				if (problems[i].max_step){
					$("#1tr" + i).append('<td colspan id = "tdPnts' + i + '" valign = "top">');
					$("#tdPnts" + i).append('Затрачено шагов: <input style = "width: 25px;"readonly id = "curStep' + i + '"> из ' + problems[i].max_step);
					$("#1tr" + i).append('</td>');
					$("#curStep" + i).attr('value', '0');
				}
				$("#1tr" + i).append('<td valign = "top" id = "tdAboutBtn' + i + '">');
				$("#tdAboutBtn" + i).append('<button class="ui-button ui-button-text-only ui-widget ui-state-default ui-corner-all" id = "aboutBtn' + i +'">');
				$("#aboutBtn" + i).append('<span class="ui-button-text">?</span>');
				$("#tdAboutBtn" + i).append('</button>');
				$("#1tr" + i).append('</td>');
				mainT.append('</tr>');
				mainT.append('<tr id = "4tr' + i +'">');
				$("#4tr" + i).append('<td id = "tdBtns' + i + '" colspan = "2" valign = "top">');
				for (var j = 0; j < btns.length; ++j)
					$("#tdBtns" + i).append('<input type = "button" class = "' + btns[j] + '" name = "btn_' + btns[j] +  i + '" id = "btn_' + btns[j] + i + '" onClick = "' + btns[j] + 'Click()"></input>');
				$("#4tr" + i).append('</td>');
				$("#4tr" + i).append('<td id = "tdBtnSubmit' + i + '" valign = "top">');
				$("#tdBtnSubmit" + i).append('<input type = "button" class = "clear" name = "btn_clear' + i + '" id = "btn_clear' + i + '" onClick = "clearClick()"></input>');
				$("#tdBtnSubmit" + i).append('<input type = "button" name="submit' + i + '" id = "submit' + i + '" class = "submit" onClick = submitClick()></input>');
				$("#4tr" + i).append('</td>');
				mainT.append('</tr>');
				mainT.append('<tr id = "2tr'+ i +'">');	
				$("#2tr" + i).append('<td id = "tdCmd' + i + '" valign = "top" height = "100%">');				
				$("#tdCmd" + i).append('<ul class = "ul_comands" id = "ul_comands' + i + '">')
				var divs = problems[i].commands;
				for (var j = 0; j < divs.length; ++j){
					$("#ul_comands" + i).append('<li id = "' + divs[j] + i + '" class = "' + divs[j] + '"><span style = "margin-left: 40px;">' + divNames[divs[j]] + '</span></li>');
					if($.browser.msie)
						$('#' + divs[j] + i).css('height', '35px');
				}
				$("#tdCmd" + i).append('</ul>');
				$("#2tr" + i).append('</td>');
				$("#2tr" + i).append('<td id = "tdField' + i + '" rowspan = "2" collspan = "2" valign = "top">');
				$("#2tr" + i).append('</td>');		
				$("#2tr" + i).append('<td id = "tdCons' + i + '" rowspan = "2" valign = "top">');
				$("#tdCons" + i).append('<textarea rows="34" cols="20" name="cons" id = "cons' + i + '" class = "cons" disabled readonly></textarea><br>');
				$("#2tr" + i).append('</td>');		
				mainT.append('</tr>');
				mainT.append('<tr id = "3tr'+ i +'">');
				$("#3tr" + i).append('<td id = "tdDrop' + i + '" valign = "top">');
				$("#tdDrop" + i).append('<hr align = "left" width = "270px"><br>');
				$("#tdDrop" + i).append('Укажите последовательность действий');
				$("#tdDrop" + i).append('<table><tr><td><ul id = "sortable' + i + '" class = "ui-sortable sortable"></ul></td></tr></table>')
				$("#3tr" + i).append('</td>');	
				mainT.append('</tr>');
				$("#ui-tabs-" + (i + 1)).append('</table>');
				copyMap(i);
				fillLabyrinth1(i);
				$("#tdSt" + i).append(problems[i].statement);
			}
		});
			
		$("#tabs").tabs("add", "#ui-tabs-" + (problems.length + 1), "Результаты");	
		$("#ui-tabs-" + (problems.length + 1)).append('<table style = "width: 100%; height: 100%"><tr><td><iframe src = "http://imcs.dvgu.ru/cats/main.pl?f=rank_table_content;cid=785773;" style = "width: 100%; height: 100%"></iframe></td></tr></table>');
	}
	function addNewCmd(str, dblClick, elem){
		if (dblClick){
			$("#sortable" + curProblem).append('<li id = "' + str + cmdId + '" class = "' + str + ' ui-draggable"><span style = "margin-left: 40px;">' + divNames[str] + '</span></li>');		
			if($.browser.msie)
				$('#' + str + cmdId).css('height', '35px');
			$("#" + str + cmdId).attr('numId', cmdId);
			$("#" + str + cmdId).attr('ifLi', 1);
			$("#" + str + cmdId).append('<span id = "spinDiv' + cmdId + '" style = "width: 60px; height: 21px; margin-left: 10px; margin-right: 0px; padding: 0px; top: 0px; posiyion: inherit"></span>');
			$("#spinDiv" + cmdId).append('<input type="input" style = "width: 30px; height: 21px; background-color: rgb(255, 255, 255); margin-right: 0px; padding-right: 0px; padding-top: 0px; border-width: 1px; padding-bottom: 0px; top: 0px; left: 0px; position: inherit"  id="spin' + cmdId + '" value="1" />');
		}
		else{
			$("#" + str + cmdId).append('<span id = "spinDiv' + cmdId + '" style = "width: 60px; height: 21px; margin-left: 10px; margin-right: 0px; padding: 0px; top: 0px; posiyion: inherit"></span>');
			$("#spinDiv" + cmdId).append('<input type="input" style = "width: 30px; height: 21px; background-color: rgb(255, 255, 255); margin-right: 0px; padding-right: 0px; padding-top: 0px; border-width: 1px; padding-bottom: 0px; top: 0px; left: 0px; position: inherit" id="spin' + cmdId + '" value="1" />');
		}
		$("#spinDiv" + cmdId).append('<input type="text" id = "spinCnt' + cmdId + '" class = "spinCnt" readonly style = "width: 60px; height: 21px; background-color: rgb(255, 255, 255); margin-right: 0px; padding-right: 0px; padding-top: 0px; border-width: 1px; padding-bottom: 0px; top: 0px; left: 0px; display:none; position: inherit;">')
		$("#spin" + cmdId++).spin({
			min: 1,
			changed: function(){
				updated();
			}
		});
	}
	function hideCounters(){
		$("#sortable" + curProblem + " > li > span > img").hide();			
		$("#sortable" + curProblem + " > li > span > input").hide();
		var el = $('#sortable' + curProblem).children();
		while (el.length > 0){
			$("#spinCnt" + el.attr('numId')).show();
			el = el.next();
		}
	}
	function showCounters(){
		$("#sortable" + curProblem + " > li > span > img").show();			
		$("#sortable" + curProblem + " > li > span > input").show();
		var el = $('#sortable' + curProblem).children();
		while (el.length > 0){
			$("#spinCnt" + el.attr('numId')).hide();
			el = el.next();
		}
	}
	function enableButtons(){
		$("#sortable" + curProblem).sortable('enable');
		for (var i = 0; i < btnsPlay.length; ++i)
			$("#btn_" + btnsPlay[i] + curProblem).removeAttr('disabled');		
	}
	function disableButtons(){
		$("#sortable" + curProblem).sortable('disable');
		for (var i = 0; i < btnsPlay.length; ++i)
			$("#btn_" + btnsPlay[i] + curProblem).attr('disabled', 'disabled');

	}
	function callPlay(s){
		if (!$("#sortable" + curProblem).sortable('toArray').length || dead[curProblem])
			return;
		pause[curProblem] = false;
		stopped[curProblem] = false;
		if (divI() >= list().length || ((divI() == list().length - 1) && cmd() == list()[divI()].cnt))
			setDefault();
		disableButtons();
		hideCounters();
		setCounters(divI() + 1);
		speed[curProblem] = s;
		setTimeout(function() { play(); }, s);
	}
	
	playClick = function(){
		callPlay(300);
	}
	fastClick = function(){
		callPlay(1);
	}
	clearClick = function(){
		if (!confirm('Вы уверены, что хотите очистить список команд?'))
			return;
		setDefault();
		$('#sortable' + curProblem).children().remove();
	}
	stopClick = function(){
		stopped[curProblem] = true;
		setDefault();
		clearClasses();
		showCounters();
	}
	pauseClick = function(){
		if (playing[curProblem])			
			pause[curProblem] = true;
		enableButtons();
	}
	nextClick = function(){
		var t = curProblem;
		if ((divI() == list().length - 1 && cmd() == list()[divI()].cnt)){
			curState[t].divIndex = list().length;
			++curState[t].step;
			curState[t].cmdIndex = 0;
			return;
		}
		else
			if (divI() >= list().length)
				return;
		if (cmd() == 0 && divI() == 0)
			setCounters();
		disableButtons();
		hideCounters();
		loop(step() + 1);
	}
	prevClick = function(){
		var t = step();
		if (step() <= 1) {
			setDefault();
			showCounters();
			setCounters();
			return;
		}
		disableButtons();
		--t;
		setDefault(true);
		hideCounters();
		setCounters();
		var s = speed[curProblem];
		speed[curProblem] = 0;
		loop(t);
		speed[curProblem] = s;
	}
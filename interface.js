﻿var btnFunctions = [playClick, pauseClick, stopClick, prevClick, nextClick, fastClick];
function fillLabyrinth(problem){
	highlightOn(problem);
	var l = problem.tabIndex;
	$('#tdField' + l).append('<table id = "table_field' + l + '" class = "field"></table>');
	var table = $('#table_field' + l);
	for (var i = 0; i < problem.map.length; ++i){
		table.append('<tr id = "tr_field' + (l * 1000 + i) + '"></tr>');
		var tr = $('#tr_field' + (l * 1000 + i));
		for (var j = 0; j < problem.map[i].length; ++j){
			tr.append('<td id = "'+ (l * 10000 + i * 100 + j)+'"></td>');
			problem.map[i][j].draw();
		}
	}
}

function login(callback){
	logined = false;
	callScript(pathPref + 'f=login;login=' + curUser.login + ';passwd=' + curUser.passwd +';json=1;', function(data){
		if (data.status == 'ok')
			sid = data.sid;
		else{
			alert(data.message);
			return false;
		}
		if(curUser.jury){
			curUser.passwd = '';
			$('#password').prop('value', '');
			for (var i = 0; i < problems.length; ++i)
				$('#forJury' + i).show();
		}
		logined = true;
		callback();
		return true;
	});
}

function showNewUser(){
	$('#userListDiv').empty();
	$('#userListDiv').append('<p>Текущий пользователь:</p>');
	$('#userListDiv').append('<p>' + curUser.name +'</p>');
	$('#userListDiv').append('<button name="changeUser" id = "changeUser">Сменить пользователя</button>');
	$('#changeUser').button();
	$('#changeUser').click(changeUser);
}

function chooseUser(){
	logined = false;
	var user = $('#userListDiv > input:checked');
	name = user[0].defaultValue;
	for (var i = 0; i < users.length; ++i){
		if (name == users[i].name){
			curUser = users[i];
			if (curUser.jury) {
				$("#enterPassword").bind("dialogbeforeclose", function(event, ui) {
					if (logined)
						showNewUser();
					$("#enterPassword").bind("dialogbeforeclose", function(event, ui){});
				});
				$('#enterPassword').dialog('open') ;
			}
			else
				login(showNewUser);
			break;
		}
	}
}

function changeUser(){
	for (var i = 0; i < problems.length; ++i)
		$('#forJury' + i).hide();
	logined = false;
	callScript(pathPref +'f=logout;sid=' + sid + ';json=1;', function(){});
	sid = undefined;
	callScript(pathPref +'f=users;cid=' + cid + ';rows=100;json=1;', function(data){
		if (!data)
			return;
		curUser = new Object();
		users = [];
		for (var i = 0; i < data.length; ++i){
			if (data[i].ooc == 1)
				continue;
			users.push({'login': data[i].login, 'name': data[i].name, 'jury': data[i].jury, 'passwd': defaultPass}); 
		}
		$('#userListDiv').empty();
		if (users.length > 0){
			$('#userListDiv').append('<p>Выберите свое имя из списка</p>');
			for (var i = 0; i < users.length; ++i){
				$('#userListDiv').append(
				'<input type="radio" name="user_name" id="user_name_' + i + '" value="' + users[i].name + '" ' + 
				(i == 0 ? 'checked': '') + ' class="radioinput" /><label for="user_name_' + i + '">' 
				+ users[i].name + '</label><br>');
			}
			$('#userListDiv').append('<br><button id = "userNameSubmit" >Выбрать пользователя</button>');
			$('#userNameSubmit').button({icons: {primary: 'ui-icon-check'}});
			$('#userNameSubmit').click(chooseUser);
		}
		else 
			$('#userListDiv').append('<p>На данный момент нет доступных пользователей</p>');	
	});
}

function submit(data, sep, l, submitStr){
	callScript(pathPref + 'f=contests;filter=json;sid=' + sid + ';json=1;', function(data){
		if (data.error == 'bad sid'){
			if (curUser.jury) {
				$("#enterPassword").bind("dialogbeforeclose", function(event, ui) {
					if (logined && confirm('Переотправить решение?'))
						submit(data, sep, l, submitStr);	
					$("#enterPassword").bind("dialogbeforeclose", function(event, ui){});
				});
				$('#enterPassword').dialog('title', 'sid устарел. Введите пароль снова');
				$('#enterPassword').dialog('open');
			}					
			else
				login(function() {submit(data, sep, l, submitStr)});
		} 
		else{
			if (atHome){
				callSubmit_('imcs.dvgu.ru', '/cats/main.pl?f=problems;sid=' + sid + ';cid=' + cid +';json=1;', submitStr, function(data){
					alert('Решение отослано на проверку');
				});  
			}
			else
			callSubmit(pathPref + 'f=problems;sid=' + sid + ';cid=' + cid+ ';json=1;', data,'imcs.dvgu.ru', '/cats/main.pl?f=problems;sid=' 
					+ sid + ';cid=' + cid, sep, l, function(data){
				alert('Решение отослано на проверку');
			});
		}
	})
}

submitClick = function(){
	if (!logined) {
		alert('Невозможно отослать решение, так как не выбран пользователь');
		return false;
	}		
	if (!sid)
		(curUser.jury) ? $('#enterPassword').dialog('open') : login();
	if (atHome){
		var result = commandsToJSON();
		submitStr = 'source=' + result + '&problem_id=' + curProblem.id + '&de_id=772264';
		submit('', '', '', submitStr);
	} 
	else {
		var result = commandsToJSON();
		var problem_id = curProblem.id;  //problem_id = 
		var de_id = 772264;
		var boundary = Math.round((Math.random() * 999999999999));
		var sep = '-------------' + boundary + '\r\n';
		var l = 0;
		function genPostQuery(serv, path, data)	{
			var result = 'Content-Type: multipart/form-data, boundary=' + sep + '\r\n';
			result += 'Content-Length: ' + data.length + '\r\n\r\n';
			l = data.length;
			result += data;
			return result;
		}
		function genFieldData(name, value){
			var result = sep + 'Content-Disposition: form-data; name="' + name + '"' + "\r\n\r\n";
			result += value + '\r\n';
			return result;
		}
		function genFileFieldData(name, filename, type, data){
			var result = sep + 'Content-Disposition: form-data; name="' + name  +  '"; filename="' + filename + '"' + "\r\n";
			result += 'Content-Type: ' + type + "\r\n\r\n";
			result += data + '\r\n\r\n';
			return result;
		}
		var data = genFieldData('search', '');
		data += genFieldData('rows', '20');
		data += genFieldData('problem_id', problem_id);
		data += genFieldData('de_id', de_id);
		data += genFieldData('submit', 'send');
		data += genFileFieldData('source', 'ans.txt', 'text/plain', result);
		data += '-------------' + boundary  + '--\r\n';
		var query = genPostQuery('imcs.dvgu.ru', '/cats/main.pl?f=problems;sid=' + sid + ';cid=' + cid, data);
		submit(data, sep, l);
	}
}

function getContests(){
	/*callScript(pathPref + 'f=contests;filter=json;sort=1;sort_dir=0;json=1;', function(data){ ////
		if (!data)
			return;
		contests = data.contests;
		for (var i = 0; i < contests.length; ++i){
				$('#contestsList').append(
				'<input type="radio" name="contest_name" id="contest_name_' + i + '" value="' + contests[i].name + '" ' + 
				(i == 0 ? 'checked': '') + ' class="radioinput" /><label for="contest_name_' + i + '">' 
				+ contests[i].name + '</label><br>');
		}
		cid = contests[0].id;
		document.title = contests[0].name;
	});*/
	fillTabs();
}

function clearTabs(){
	$('#tabs > div').each(function(index, elem){
		$(elem.id).empty();
		$('#tabs').tabs('remove', index);
	});
}

function changeContest(){
	var contest = $('#contestsList > input:checked');
	name = contest[0].defaultValue;
	document.title = name;
	for (var i = 0; i < contests.length; ++i){
		if (name == contests[i].name){
			if (cid != contests[i].id){
				cid = contests[i].id;
				fillTabs();
			}
			break;
		}
	}
}

function onAddWatchClick()
{
	$('#addWatchDialog').dialog('open');
}

function fillTabs(){
	if ($('#ui-tabs-0').length){
		$('#ui-tabs-0').empty();
		$('#tabs').tabs('remove', 0);
	}
	$('#tabs').tabs('add', '#ui-tabs-0', "Выбор пользователя", 0);
	$('#ui-tabs-0').append('<table width = "100%"><tr id = "tab0"><td><div id = "userListDiv"></div></td>');
	$('#tab0').append('<td valign = "top" align = "right"><button id = "changeContestBtn">Выбрать турнир</button></td></tr>');
	$('#ui-tabs-0').append('</table>');
	$('#changeContestBtn').button();
	$('#changeContestBtn').click(function(){
		$('#contestsList').show(); 
		$('#changeContest').dialog('open'); 
		return false; 
	}); 
	//changeUser();
	problems = [];
	//callScript(pathPref + 'f=problem_text;notime=1;nospell=1;noformal=1;cid=' + cid + ';nokw=1;json=1', function(data){
		for (var i = 0; i < problemsData.length; ++i){
			problems[i] = $.extend({}, problemsData[i], problemsData[i].data);
			problems[i].tabIndex = i;
			getTest(problemsData[i].data, i);
			if ($('#ui-tabs-' + (i + 1)).length){
				$('#ui-tabs-' + (i + 1)).empty();
				$('#tabs').tabs('remove', i + 1);
			}
			$('#tabs').tabs('add', '#ui-tabs-' + (i + 1),problems[i].title, i + 1);
			var divs = [];
			for (var j = 0; j < problems[i].commands.length; ++j)
			{
				divs.push({'tab': i, 'divclass': problems[i].commands[j], 'divname': cmdClassToName[problems[i].commands[j]]});
			}
			divs.push({'tab': i, 'divclass': 'if', 'divname': cmdClassToName['if']});
			divs.push({'tab': i, 'divclass': 'ifelse', 'divname': cmdClassToName['ifelse']});
			divs.push({'tab': i, 'divclass': 'while', 'divname': cmdClassToName['while']});
			divs.push({'tab': i, 'divclass': 'for', 'divname': cmdClassToName['for']});
			var buttons = [];
			for (var j = 0; j < btns.length; ++j)
			{
				buttons.push({'tab': i, 'btn': btns[j], 'title': btnTitles[j]});
			}
			$('#tabTemplate').tmpl({'tab': i, 
				'statement': problems[i].statement, 
				'maxCmdNum': problems[i].maxCmdNum,
				'maxStep': problems[i].maxStep,
				'commands': divs,
				'btns': buttons},{}).appendTo('#ui-tabs-' + (i + 1));
			$('#exportBtn' + i).button();
			$('#importBtn' + i).button();
			$('#exportBtn' + i).click(function() { return exportCommands(); });
			$('#importBtn' + i).click(function() { return import_(); });
			$('#export' + i).dialog({
				modal: true,
				buttons: {
					Ok: function() {
						$(this).dialog('close');
					}
				}, 
				autoOpen: false,
				title: 'Список команд',
				minWidth: 250,
				minHeight: 400
			});
			$('#import' + i).dialog({
				modal: true,
				buttons: {
					'Load': function() {
						if (!confirm('Вы уверены, что хотите изменить список команд?'))
							return;
						importCommands();
					},
					'Cancel': function() {
						$(this).dialog('close');
					}
				}, 
				autoOpen: false,
				title: 'Загрузка списка команд',
				minWidth: 250,
				minHeight: 400
				
			});
			$('#hideStatement' + i)
				.button({text: false, icons: {primary: 'ui-icon-minus'}})
				.click(function(j){
					return function(){
						if ($('#statement' + j).is(':visible'))
						{
							$('#statement' + j).hide();
							$(this).button( 'option', 'icons', {primary:'ui-icon-plus'});
						}
						else
						{
							$('#statement' + j).show();
							$(this).button( 'option', 'icons', {primary:'ui-icon-minus'});
						}
					}
				}(i));
			$('#progressBar' + i).progressbar({value: 0});
			$('#btn_clear' + i).button({text:false, icons: {primary: 'ui-icon-trash'}});
			$('#btn_clear' + i).click(clearClick);
			$('#submit' + i).button({icons: {primary: 'ui-icon-check'}});
			$('#submit' + i).click(submitClick);
			$('#tdcode' + i).hide();
			$('#addWatch' + i).hide();
			$('#watchTable' + i).hide();
			var CM = CodeMirror.fromTextArea($('#codearea' + i)[0], {
				lineNumbers: true,
				onGutterClick: function(cm, n) {
					var info = cm.lineInfo(n);
						if (info.markerText)
							cm.clearMarker(n);
						else
						cm.setMarker(n, "<span style=\"color: #900\">●</span> %N%");
				},
			    mode: {name: "python",
		           version: 2,
		           singleLineStringErrors: false},
		        indentUnit: 4,
		        tabMode: "shift",
		        matchBrackets: true
			});
			codeareas.push(CM);
			var groupBox = "input[name='group" + i + "']";
			$(groupBox).change(function(j){
				return function(){
				    if ($("input[name='group" + j + "']" + ":checked").prop('id') == 'commandsMode' + j)
			    	{
			    		$('#ulCommands' + j).show();
						$('#jstree-container' + j).show();
						$('#tdcode' + j).hide();
						$('#addWatch' + j).hide();
						$('#watchTable' + j).hide();
						$('#btn_prev' + j).prop('disabled', false);
						$('#btn_fast' + j).prop('disabled', false);
						$('#tdcommands' + j).show();
						$('#tdcontainer' + j).show();
						//if (!finalcode[getCurProblem()])
						prepareForExecuting(getCurProblem());
						$('#jstree-container' + j).empty();
						curProblem.cmdList = undefined;
						convertTreeToCommands(finalcode[getCurProblem()].compiled.ast.body).generateCommand(
							jQuery.jstree._reference('#jstree-container' + j) );
						++cmdId;
						updated();
			    	}
				    else
			    	{
			    		$('#ulCommands' + j).hide();
						$('#jstree-container' + j).hide();
						$('#tdcommands' + j).hide();
						$('#tdcontainer' + j).hide();
						$('#tdcode' + j).show();
						codeareas[j].setValue(convertCommandsToCode());
						codeareas[j].refresh();
						$('#addWatch' + j).show();
						$('#watchTable' + j).show();
						$('#btn_prev' + j).prop('disabled', true);
						$('#btn_fast' + j).prop('disabled', true);

			    	}
				}
			}(i));
			fillLabyrinth(problems[i]);
			$('#forJury' + i).hide();
			for (var j = 0; j < btns.length; ++j){
				$('#btn_'+ btns[j] + i).button({text: false, icons: {primary: buttonIconClasses[j]}});
				$('#btn_'+ btns[j] + i).bind('click', function() {
					hideFocus();
					eval( $(this).prop('name') + 'Click()'); 		
					return false;
				});
			}
			$('#addWatch' + i)
				.button()
				.click(function(j)
				{
					return function()
					{
						$('#addWatchDialog').dialog('open');
					}
				}(i));
			lastWatchedIndex.push(0);
			watchList.push({});
		}
		
	//});
	if ($('#ui-tabs-' + (problems.length + 1)).length){
		$('#ui-tabs-' + (problems.length + 1)).empty();
		$('#tabs').tabs('remove', (problems.length + 1));
	}
	$('#tabs').tabs('add', '#ui-tabs-' + (problems.length + 1), 'Результаты', (problems.length + 1));
	$('#ui-tabs-' + (problems.length + 1)).append('<button id = "refreshTable">Обновить таблицу</button>');
	$('#refreshTable').button({text:false, icons: {primary: 'ui-icon-refresh'}});
	$('#ui-tabs-' + (problems.length + 1)).append('<table class = "results"><tr><td>' + 
		'<iframe id = "results" src = "' + resultsUrl + cid + ';" class = "results"></iframe></td></tr></table>');
	$('#refreshTable').click(function() {$('#results').prop('src', resultsUrl + cid)});
		$('#tabs').tabs('select', 0);
	for(var i = $('#tabs').tabs('length') - 1; i > problems.length + 1; --i){
	  while($('#ui-tabs-' + i).length){
			$('#ui-tabs-' + i).empty();
			$('#tabs').tabs('remove', i);
		}
	}
	$('#tabs').tabs('add', '#ui-tabs-' + (problems.length + 2), 'test code mirror', (problems.length + 2));
	$('#ui-tabs-' + (problems.length + 2)).append('<div id = "pythonForm"></div>');
	$('#pythonForm').append('<textarea id = "code" name = "code"></textarea>');
	$('#pythonForm').append('<select id = "selectTest" name = "selectTest" onchange = "testChanged()"></select>');
	for(var i = 0; i < TESTS_NUM; i++)
	{
		$('#selectTest').append('<option id = "test' + i + '" value = "' + i + '">' + (i + 1) + '</option>');
	}
	$('#code').append(tests[0]);
	codeareas[problems.length + 1] = CodeMirror.fromTextArea($('#code')[0], {
		lineNumbers: true,
		onGutterClick: function(cm, n) {
			var info = cm.lineInfo(n);
				if (info.markerText)
					cm.clearMarker(n);
				else
				cm.setMarker(n, "<span style=\"color: #900\">●</span> %N%");
		},
	    mode: {name: "python",
           version: 2,
           singleLineStringErrors: false},
        indentUnit: 4,
        tabMode: "shift",
        matchBrackets: true
	});
	$('#ui-tabs-' + (problems.length + 2)).append('<button id = "btnPython">Post python code</button>');
	$('#ui-tabs-' + (problems.length + 2)).append('<button id = "btnPythonNext">next</button>');
	$('#ui-tabs-' + (problems.length + 2)).append('<button id = "addWatch' + (problems.length + 1) + '">Add watch</button>');
	$('#pythonForm').append('<pre id = "cons' + (problems.length + 1) + '"></pre>');
	$('#pythonForm').append('<input type = "checkbox" onchange = "showHideCode()" id = "showHide">Show/hide code</input>');
	$('#pythonForm').append('<pre id = "codeRes1"></pre>');
	$('#pythonForm').append('<div id = "watchDiv"><table id = "watchTable' + (problems.length + 1) + '"></table></div>');
	$('#addWatch' + (problems.length + 1)).button().click(onAddWatchClick);
	$('#btnPython').button();
	$('#btnPython').click(tryCode);
	$('#btnPythonNext').button();
	$('#btnPythonNext').click(tryNextStep);
}

function exportCommands(){
	$('#export' + curProblem.tabIndex).html(commandsToJSON());
	$('#export' + curProblem.tabIndex).dialog('open');
	return false;
}

function addIf(str, andElse){
	$('#' + str + cmdId).append('<select id = "ifselect' + cmdId +'">');
	var options = ['wall at the left', 'wall at the right'];
	for (var i = 0; i < options.length; ++i)
	{
		$('#ifselect' + cmdId).append('<option value = ' + i + '>' + options[i] + '</option><br>');
	}
	$('#' + str + cmdId).append('</select>');
	$('#ifselect' + cmdId).change(updated);
	addBlock(str, 'if');
	if (andElse)
		addBlock(str, 'else');
	$('#' + str + cmdId).css('height', andElse ? '440px' : '220px');
}

function addWhile(str){
	$('#' + str + cmdId).append('<select id = "whileselect' + cmdId +'">');
	var options = ['wall at the left', 'wall at the right'];
	for (var i = 0; i < options.length; ++i)
	{
		$('#whileselect' + cmdId).append('<option value = ' + i + '>' + options[i] + '</option><br>');
	}
	$('#' + str + cmdId).append('</select>');
	$('#whileselect' + cmdId).change(updated);
	addBlock(str, 'while');
	$('#' + str + cmdId).css('height', '220px');
}

function addFor(str, cnt){
	$('#' + str + cmdId).append('<span align = "right" id = "spinDiv' + cmdId + '" class = "cnt"></span>');
	$('#spinDiv' + cmdId).append('<input class = "cnt"  id="spin' + cmdId + '" value="' + cnt + '" type="text"/>');
	addBlock(str, 'for');
	$('#' + str + cmdId).css('height', '220px');
}

function addBlock(name, str){
	$('#' + name + cmdId).append('<ul id = "sortable' + str + cmdId + '" class = "ui-sortable sortable connectedSortable" style = "height: 200px; width: 220px;">');
	$('#' + name + cmdId).css('height', '200px');
	//if (str != 'for')
	//	$('#' + name + cmdId + ' > span').remove();
	$('#sortable' + str + cmdId).sortable({
		revert: false,
		cursor: 'move',
		appendTo: 'body',
		helper: 'clone',
		//connectWith: '.connectedSortable' 
	}).disableSelection();
	$('#sortable' + str + cmdId).prop('sortName', 'sortable' + str + cmdId);
	$('#sortable' + str + cmdId).prop('cmdId', cmdId);
	$('#sortable' + str + cmdId).bind('sortbeforestop', function(event, ui) {
		cmdAdded = true;
		var item = ui.helper.is(':visible') ? ui.helper : ui.item;
		if (item.offset().left > $(this).offset().left + parseInt($(this).css('width')) / 2 ||
			item.offset().left + parseInt(item.css('width'))/2 < $(this).offset().left ||
			item.offset().top > $(this).offset().top + parseInt($(this).css('height')) / 2 ||
			item.offset().top + 10 < $(this).offset().top)
		{
			ui.item.remove();
			updated();
			return;
		}
		var id = "";
		for (var k = 0; k < classes.length; ++k)
		{
			if (ui.item.hasClass(classes[k]))
			{
				id = classes[k];
				break;
			}
		}
		id += cmdId;
		if (!ui.item.prop('numId')){
			ui.item.prop('id', id);
			ui.item.prop('ifLi', 1);
			ui.item.prop('numId', cmdId);
			for (var j = 0; j < classes.length; ++j)
				if (ui.helper.hasClass(classes[j])){
					addNewCmd(classes[j], false, ui.item[0]);
				}
		}
		$('#cons0').append('sortbeforestop #sortable' + str + $(this).prop('cmdId') + '\n');
		curProblem.cmdListEnded = false;
	});
	$('#sortable' + str + cmdId).bind('sortstop', function(event, ui) {
		++stoppedLvl;
		$('#cons0').append('sortstop #sortable' + str +  $(this).prop('cmdId') + '\n');

	});
	$('#sortable' + str + cmdId).bind('sortreceive', function(event, ui) {
		$('#cons0').append('sortreceive #sortable' + str +  $(this).prop('cmdId') + '\n');

	});
	$('#sortable' + str + cmdId).bind('sortout', function(event, ui) {
		var i = 0;	
	});
	$('#sortable' + str + cmdId).bind('click', function(event, ui) {
		if (!curProblem.playing)
			showCounters();
	});
	var sortables =  $('#' + name + curProblem.tabIndex).draggable('option', 'connectToSortable');
	sortables = '#sortable' + str + cmdId + ', ' + sortables;
	for (var k = 0; k < classes.length; ++k){
		$('#' + classes[k] + curProblem.tabIndex).draggable('option', 'connectToSortable', sortables);
	}

}
	
function addCmd(name, cnt){
	$('#sortable' + curProblem.tabIndex).append('<li id = "' + name + cmdId + '" class = "' + name + ' ui-draggable"></li>');		
	if($.browser.msie)
		$('#' + name + cmdId).css('height', '35px');
	if (name == 'block')
	{
		addBlock('block', 'block');
	}
	else if (name == 'if' || name == 'ifelse')
	{
		addIf(name, name == 'ifelse');
	}
	else if (name == 'while')
	{
		addWhile(name);
	}
	else if (name == 'for')
	{
		addFor(name, 1);
	}
	else
	{
		$('#' + name + cmdId).append('<span style = "margin-left: 40px;">' + cmdClassToName[name] + '</span>');
		$('#' + name + cmdId).append('<span align = "right" id = "spinDiv' + cmdId + '" class = "cnt"></span>');
		$('#spinDiv' + cmdId).append('<input class = "cnt"  id="spin' + cmdId + '" value="' + cnt + '" type="text"/>');
	}
	$('#' + name + cmdId).prop('numId', cmdId);
	$('#' + name + cmdId).prop('ifLi', 1);
}

function setSpin(){
	$('#spinDiv' + cmdId).append('<input id = "spinCnt' + cmdId + '" class = "spinCnt" type="text">')
	$('#spin' + cmdId++).spin({
		min: 1,
		changed: function(){
			updated();			
		}
	});
}

function import_(){
	$('#importText' + curProblem.tabIndex).show();
	$('#import' + curProblem.tabIndex).dialog('open');
	return false;
}

function importCommands(){
	var cmds = jQuery.parseJSON($('#importText' + curProblem.tabIndex).prop('value'));
	if (cmds){
		$('#sortable' + curProblem.tabIndex).children().remove();
		for (var i = 0; i < cmds.length; ++i){
			addCmd(cmds[i].dir, cmds[i].cnt);
			setSpin();
		}
		updated();
		setDefault();
		setCounters(0);
	}
	$('#import' + curProblem.tabIndex).dialog('close');
}

function addNewCmd(str, dblClick, elem){
	if (dblClick)	
		addCmd(str, 1);
	else if (str == 'block')
	{
		addBlock('block', 'block');
	}
	else if (str == 'if' || str == 'ifelse')
	{
		addIf(str, str == 'ifelse');
	}
	else if (str == 'while')
	{
		addWhile(str);
	}
	else if (str == 'for')
	{
		addFor(str, 1);
	}
	else
	{
		$('#' + str + cmdId).append('<span align = "right" id = "spinDiv' + cmdId + '" class = "cnt"></span>');
		$('#spinDiv' + cmdId).append('<input class = "cnt"  id="spin' + cmdId + '" value="1" type="text"/>');
	}
	
	
}

function onCreateItem(tree, newNode, initObject){
	var type = initObject.attr('rel');
	tree.set_type(type, newNode);
	tree.rename_node(newNode, cmdClassToName[type]);
	switch(type){
		case 'left':
		case 'right':
		case 'forward':
		case 'wait':
		case 'for':
			$(newNode).append('<span align = "right" id = "spinDiv' + cmdId + '" class = "cnt"></span>');
			$('#spinDiv' + cmdId).append('<input class = "cnt"  id="spin' + cmdId + '" value="1" type="text"/>');
			break;
		case 'if':
		case 'ifelse':
		case 'while':
			$(newNode).append('<select id = "select' + cmdId +'">');
			var options = ['wall at the left', 'wall at the right'];
			for (var i = 0; i < options.length; ++i)
			{
				$('#select' + cmdId).append('<option value = ' + i + '>' + options[i] + '</option><br>');
			}
			$(newNode).append('</select>');
			$('#select' + cmdId).change(updated);
			if (type == 'ifelse'){
				tree.rename_node(newNode, 'If');
				$("#jstree-container" + curProblem.tabIndex).jstree("create", $(newNode), "after", false, 
					function(elseNode){
					tree.set_type('else', elseNode);
					tree.rename_node(elseNode, 'Else');
						$(elseNode).prop('numId', cmdId);
						$(elseNode).prop('ifLi', 1);
						$(elseNode).prop('type', 'else');
						$(elseNode).addClass('else');
						$(elseNode).prop('id', 'else' + cmdId);
				}, true); 
			}
			break;
	}
	$(newNode).prop('numId', cmdId);
	$(newNode).prop('ifLi', 1);
	$(newNode).prop('type', type);
	$(newNode).addClass(type);
	$(newNode).prop('id', type + cmdId);
	setSpin();
	updated();
}
function isBlock(type){
	return type == false || type == 'block' || type == 'if' || type == 'ifelse' || 
		type == 'while' || type == 'for' || type == 'else';
}

function hideCounters(){
	curProblem.cmdList.hideCounters();

}

function showCounters(){
	curProblem.cmdList.showCounters();
}

function enableButtons(){
	$('#sortable' + curProblem.tabIndex).sortable('enable');
	for (var i = 0; i < btnsPlay.length; ++i)
		$('#btn_' + btnsPlay[i] + curProblem.tabIndex).removeAttr('disabled');		
}

function disableButtons(){
	$('#sortable' + curProblem.tabIndex).sortable('disable');
	for (var i = 0; i < btnsPlay.length; ++i)
		$('#btn_' + btnsPlay[i] + curProblem.tabIndex).prop('disabled', true);
}

function callPlay(s){
	//if (!$('#sortable' + curProblem.tabIndex).sortable('toArray').length || curProblem.arrow.dead)
	//	return;

	var problem = curProblem.tabIndex;
	if (curProblem.maxCmdNum && curProblem.divIndex == curProblem.maxCmdNum){
		var mes = new MessageCmdLimit();
		curProblem.arrow.dead = true;
		return;
	}
	if (!curProblem.playing || curProblem.arrow.dead)
	{
		setCounters();
		hideCounters();
		setDefault();
		//curProblem.playing = true;
	}
	try
	{	
		if (!curProblem.playing)
		{
			if (!$('#codeMode' + problem).prop('checked'))
			{
				codeareas[curProblem.tabIndex].setValue(convertCommandsToCode());
			}
			prepareForExecuting(problem, !curProblem.speed);
			curProblem.playing = true;
		}
		curProblem.paused = false;
		curProblem.stopped = false;
		disableButtons();
		hideCounters();
		curProblem.speed = s;
		curProblem.lastExecutedCmd = undefined;
		setTimeout(function() { play(MAX_VALUE); }, s);
	}
	catch(e)
	{
		curProblem.playing = false;
		$('#cons' + curProblem.tabIndex).html('Invalid commands');
	}
}

function onFinishExecuting(problem)
{
	/*finalcode[problem] = undefined;
	$scope[problem] = undefined,
	$gbl[problem] = undefined,
	$loc[problem] = $gbl[problem];
	nextline[problem] = undefined;
	for (var i = 0; i < codeareas[problem].lineCount(); ++i)
		codeareas[problem].setLineClass(i, null);
	updateWatchList();*/
}

function prepareForExecuting(problem, dontHighlight)
{
	setDefault();
	curProblem.playing = false;
	cmdHighlightOff();
	showCounters();
	setCounters();
	var output = $('#cons' + problem);
	var input = codeareas[problem].getValue();
	if (curProblem.maxCmdNum)
	{
		var cmds = (' ' + input).match(/\W(forward\(\)|left\(\)|right\(\)|wait\(\))/g);
 		var cmdNum = 0;
		if (cmds)
			cmdNum = cmds.length;
		if (cmdNum > curProblem.maxCmdNum)
		{
			$('#cons' + problem).html('Чиcло команд превышает допустимое');
			curProblem.playing = false;
			return;
		}
		$('#curStep' + problem).text(cmdNum);
		$('#progressBar'  + problem).progressbar('option', 'value',  cmdNum / curProblem.maxCmdNum * 100);	
	}
	output.html('');
	Sk.configure({output:outf, 'problem': problem});
	finalcode[problem] = Sk.importMainWithBody("<stdin>", false, input);
	$scope[problem] = 0,
	$gbl[problem] = {},
	$loc[problem] = $gbl[problem];
	for (var i = 0; i < finalcode[problem].compiled.scopes.length; ++i)
	{
		eval('$loc[' + problem + '].' + finalcode[problem].compiled.scopes[i].scopename + ' = {};');
		eval('$loc[' + problem + '].' + finalcode[problem].compiled.scopes[i].scopename + '.defaults = [];');
		eval('$loc[' + problem + '].' + finalcode[problem].compiled.scopes[i].scopename + '.stack = [];');
	}
	eval('$loc[' + problem + '].scope0.stack.push({"loc": {}, "param": {}, blk: 0});');
	nextline[problem] = getScope().firstlineno;
	if (!dontHighlight)
		codeareas[problem].setLineClass(nextline[problem], 'cm-curline');
	$scopename[problem] = finalcode[problem].compiled.scopes[0].scopename;
	$scopestack[problem] = 0;
	$gbl[problem]['forward'] = forward;
	$gbl[problem]['left'] = left;
	$gbl[problem]['right'] = right;
	$gbl[problem]['wait'] = wait;
	//curProblem.stopped = true;
	updateWatchList();
	curProblem.changed = false;
}

function playClick(){
	var problem = getCurProblem();
	callPlay(300);
	$('#btn_play'+ curProblem.tabIndex).addClass('ui-state-focus');
}

function fastClick(){
	cmdHighlightOff();
	callPlay(0);
}

function clearClick(){
	if (!confirm('Вы уверены, что хотите очистить список команд?'))
		return;
	setDefault();
	$('#jstree-container' + curProblem.tabIndex).children().remove();
}

function stopClick(){
	var problem = getCurProblem();
	if ($('#codeMode' + problem).prop('checked'))
		onFinishExecuting(problem);
	curProblem.stopped = true;
	//if (!curProblem.playing || !curProblem.speed)
	//{
		setDefault();
		cmdHighlightOff();
		showCounters();
		setCounters();
		curProblem.playing = false;
	//}
}

function pauseClick(){
	if (curProblem.playing)			
		curProblem.paused = true;
	enableButtons();
}

function nextClick(){
	var problem = getCurProblem();
	if ($('#codeMode' + problem).prop('checked'))
	{
		try
		{
			if (!curProblem.playing)
			{
				prepareForExecuting(problem);
				curProblem.playing = true;
			}
			else
			{
				tryNextStep();
				if (!curProblem.playing)
					onFinishExecuting(problem);
			}
		}
		catch (e)
		{
			curProblem.playing = false;
			alert(e)
		}
	}
	else
	{
		curProblem.speed = 0;
		if (!curProblem.playing || curProblem.changed)
		{
			try
			{
				codeareas[problem].setValue(convertCommandsToCode());
				prepareForExecuting(problem);
			}
			catch(e)
			{
				$('#cons' + problem).html('Invalid commands');
				return;
			}
		}
		if (!curProblem.playing)
		{
			setCounters();
			hideCounters();
			var needReturn = curProblem.cmdList.isFinished();
			setDefault();
			if (needReturn)
				return;
			
			curProblem.playing = true;
		}
		curProblem.lastExecutedCmd = undefined;
		cmdHighlightOff();
		curProblem.cmdList.exec(1);
		highlightLast();
		drawLabirint();
		++curProblem.step;
		if (curProblem.cmdList.isFinished())
			curProblem.playing = false;
	}
}

function prevClick(){
	var t = step();
	if (step() <= 1) {
		setDefault();
		curProblem.playing = false;
		showCounters();
		setCounters();
		return;
	}
	++c;
	--t;
	setDefault(true);
	disableButtons();
	hideCounters();
	var s = curProblem.speed;
	curProblem.speed = 0;
	curProblem.playing = true;
	curProblem.nextOrPrev = true;
	play(t);

}

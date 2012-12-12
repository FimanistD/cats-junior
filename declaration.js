var curProblem;
var problems = [];
var users = [];
var curUser;
var logined = false;
var defaultPass = 12345;
var cid = 791634; // contest id
var sid; // session id
var cmdId; // current number for added command(generated for dynamic creating of sortable elements)
var pathPref = atHome ? 'http://imcs.dvgu.ru/cats/main.pl?' : '/cats/main.pl?';
var resultsUrl = atHome ? 'http://imcs.dvgu.ru/cats/main.pl?f=rank_table_content;cid=' : '/cats/main.pl?f=rank_table_content;cid=';
var visited = []; // if tab have already been visited -- for proper tabs displaying
var arrow = [];
var contests;
var cmdClassToName = {
	'forward': 'Прямо',
	'left': 'Налево',
	'right': 'Направо',
	'wait': 'Ждать',
	'block': 'Block',
	'if': 'Если',
	'ifelse': 'Если...Иначе',
	'while': 'Пока',
	'for': 'Повтор',
	'funcdef': 'Функция'
};
var classes = ['forward', 'left', 'right', 'wait', 'block', 'if', 'ifelse', 'while', 'for', 'funcdef'];
var changeDir = {
	'forward':{
		'up': {dx: 0, dy: -1, curDir: 'up'},
		'down': {dx: 0, dy: 1, curDir: 'down'},
		'left':{dx: -1, dy: 0, curDir: 'left'},
		'right': {dx: 1, dy: 0, curDir: 'right'}
	},
	'left':{
		'up': {dx: 0, dy: 0, curDir: 'left'},
		'down': {dx: 0, dy: 0, curDir: 'right'},
		'left':{dx: 0, dy: 0, curDir: 'down'},
		'right': {dx: 0, dy: 0, curDir: 'up'}
	},
	'right':{
		'up': {dx: 0, dy: 0, curDir: 'right'},
		'down': {dx: 0, dy: 0, curDir: 'left'},
		'left':{dx: 0, dy: 0, curDir: 'up'},
		'right': {dx: 0, dy: 0, curDir: 'down'}
	}, 
	'wait':{
		'up': {dx: 0, dy: 0, curDir: 'up'},
		'down': {dx: 0, dy: 0, curDir: 'down'},
		'left':{dx: 0, dy: 0, curDir: 'left'},
		'right': {dx: 0, dy: 0, curDir: 'right'}
	},
	'behind':{
		'up': {dx: 0, dy: 1, curDir: 'up'},
		'down': {dx: 0, dy: -1, curDir: 'down'},
		'left':{dx: 1, dy: 0, curDir: 'left'},
		'right': {dx: -1, dy: 0, curDir: 'right'}
	}
	
}
var dirs = {'R': 'right', 'L': 'left', 'U': 'up', 'D': 'down'};
var maxx = 185;
var miny = 0;
var btnsPlay = ['play', 'next', 'prev'];
var btns = ['play', 'pause', 'stop', 'prev', 'next'];
var btnTitles = ['Проиграть', 'Пауза', 'Стоп', 'Предыдущий шаг', 'Следующий шаг', 'В конец'];
var buttonIconClasses = ['ui-icon-play', 'ui-icon-pause', 'ui-icon-stop', 'ui-icon-seek-prev', 'ui-icon-seek-next', 'ui-icon-seek-end'];
var c = 0;
var curDebugState;
var worker;
var lastWatchedIndex = [];
var watchList = [];
var codeareas = [];
var finalcode = [], 
	$gbl = [], 
	$loc = [], 
	$expr = [], 
	$scope = [], 
	nextline = [], 
	$scopename = [], 
	$scopestack = [];
	
var problemsData = [
{
	'code': "D", 
	'id': 792984, 
	'input_format': "<div>\n  Входной файл.\n</div>",	
	'title': "Задача-1",
	'statement': "<div>\n<p>\nВаша задача состоит в том, чтобы, затратив не более, чем определенное в условии количество команд, набрать как можно больше очков.</p>\n<p>Столкновение с монстром означает проигрыш.</p> \n<p>За собранную звездочку получаете 20 очков.\n</p>\n</div>",
	'data': 
		{	
	"map": [
["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
["#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
["#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#"],
["#", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", "#", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", ".", "#", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", ".", ".", ".", "#", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#", ".", ".", ".", "#", ".", "#", ".", ".", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", "#", "#", "#", "#", ".", "#", "#", "#", "#", "#", ".", "#", ".", "#", "#", "#", ".", "#", ".", "#", "#", "#", "#", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", ".", ".", ".", ".", ".", ".", "#", ".", ".", ".", ".", ".", "#", ".", ".", ".", "#", ".", "#", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#"],
["#", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", ".", ".", ".", ".", "#", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
["#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", ".", ".", ".", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
["#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", ".", "D", ".", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", ".", ".", ".", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#"],
["#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#", ".", ".", ".", ".", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#"],
["#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#", "#", "#", ".", "#", "#", "#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#", ".", ".", ".", "#", ".", "#", ".", ".", ".", "#", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", "#", "#", "#", "#", ".", "#", ".", "#", "#", "#", ".", "#", ".", "#", ".", "#", "#", "#", ".", "#", "#", "#", "#", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", ".", ".", "#", ".", "#", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#", ".", ".", ".", "#", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", ".", "#", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#", ".", "#", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#"],
["#", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#", ".", "#", ".", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", ".", "#"],
["#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#", ".", "#", ".", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", ".", "#"],
["#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#", "*", "#", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "#"],
["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]],
	"specSymbols": [
		{
			"symbol": "*",
			"count": 1,
			"style": "star",
			"name": "������",
			"action": "eat",
			"points": 25,
			"dLife": 0, 
			"zIndex": 2 
		}
	],
	"keys": [],
	"locks": [],
	"movingElements":[],
	"commands": ["forward", "left", "right", "wait"],
	"startLife": 1,
	"dLife": 0,
	"startPoints": 0,
	"maxCmdNum": 40
}
}];
var cmdAdded = false;
var addedCmds = [];
var prevCmd = undefined;
var stoppedLvl = 0;
var MAX_VALUE = 999999999999999;
var receiveStarted = false;
var elseStmt = undefined;
var maxStep = 100;
var undo = false;

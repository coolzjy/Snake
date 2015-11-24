var snake=(function(){
/**
 *=======地图类=======
 * 用来构造游戏地图
 * @param	int	rows	行数
 * @param	int	cols	列数
 * @param	string	container	地图容器，推荐 div
 *===================
 */
var Grid = {
	create: function(p_rows, p_cols, p_container){
		var obj = {};
		
		// 行数
		obj.rows = p_rows;
		// 列数
		obj.cols = p_cols;
		
		/**
		 *=======绘图=========
		 * 在容器中绘制游戏地图
		 *===================
		 */
		(function(){
			// 地图容器
			if(typeof(p_container) === "string"){
				var container = document.getElementById(p_container);
			}
			else{
				var container = p_container;
			}
			
			
			//地图
			var map = document.createElement("table");
			map.className = "grid";
			
			//生成行列
			for(var rowCount = 0; rowCount < obj.rows; rowCount++){
				var row = document.createElement("tr");
				for(var colCount = 0; colCount < obj.cols; colCount++){
					var col = document.createElement("td");
					col.id="_grid_r"+rowCount+"c"+colCount;
					row.appendChild(col);
				}
				map.appendChild(row);
			}
			container.appendChild(map);
		})();
		
		/**
		 *=======绘制点=======
		 * 在地图中绘制点
		 * @param	int	x	横坐标（0至cols-1）
		 * @param	int	y	纵坐标（0至rows-1）
		 *===================
		 */
		obj.drawDot = function(x, y){
			var dot = document.getElementById("_grid_r"+y+"c"+x);
			dot.className = "dot";
		};
		
		/**
		 *=======清除点=======
		 * 在地图中清除点
		 * @param	int	x	横坐标（0至cols-1）
		 * @param	int	y	纵坐标（0至rows-1）
		 *===================
		 */
		obj.easeDot = function(x,y){
			var dot = document.getElementById("_grid_r"+y+"c"+x);
			dot.className = "";
		};
		
		/**
		 *=======清除=========
		 * 清除地图中的所有点
		 *===================
		 */
		obj.clear = function(){
			var dots = document.getElementsByClassName("dot");
			for(dot in dots){
				dots[dot].className = "";
			}
		};
		
		return obj;
	}
}

/**
 *=======蛇类========
 * 用来构造贪吃蛇
 * @param	Grid	p_grid	地图对象
 * @param	int	p_length	初始长度
 * @param	int	p_speed=500	初始速度
 *===================
 */
var Snake = {
	create: function(p_grid, p_length, p_speed){
		var obj = {};
		// 地图对象
		var grid = p_grid;
		// 长度;
		var length = p_length || 4;
		// 速度
		var speed = p_speed || 500;
		// 最小速度
		var minSpeed = 100;
		// 方向
		var direction;
		// 食物
		var food;
		// 蛇身数组
		var snakeBody;
		// 定时器
		var interval = null;
		// 操作队列
		var opreations = new Array();
		// 按键映射
		var directions = {"37":{opreation:"l",oppsite:"r"},"38":{opreation:"u",oppsite:"d"},"39":{opreation:"r",oppsite:"l"},"40":{opreation:"d",oppsite:"u"}};
		
		/**
		 *=======生成食物=====
		 * 在地图上随机生成食物
		 * @return	Object	食物坐标对象
		 *===================
		 */
		var createFood = function(){
			var food = {};
			function foodOK(){
				for(var i=0; i < snakeBody.length; i++){
					if(food.x==snakeBody[i].x&&food.y==snakeBody[i].y) return false;
				}
				return true;
			}
			do{
				food.x = Math.floor(Math.random()*grid.cols);
				food.y = Math.floor(Math.random()*grid.rows);
			}while(!foodOK())
			grid.drawDot(food.x, food.y);
			return food;
		}
		
		/**
		 *=======判断是否存活======
		 * 判断蛇是否满足存活条件
		 * @return	Boolean	是否存活
		 *=======================
		 */
		var isAlive = function(){
			var isAlive = true;
			for(var i = 1; i < snakeBody.length; i++){
				if(snakeBody[0].x===snakeBody[i].x&&snakeBody[0].y===snakeBody[i].y) isAlive = false;
			}
			if(snakeBody[0].x < 0 || snakeBody[0].y < 0 || snakeBody[0].x > grid.cols-1 || snakeBody[0].y > grid.rows-1) isAlive = false;
			if(!isAlive){
				clearInterval(interval);
			}
			return isAlive;
		}
		
		/**
		 *=======行进=========
		 * 驱动蛇身行进
		 *====================
		 */
		var forward = function(){
			// 读取操作队列中的方向
			direction = opreations.pop() || direction;
			
			// 生成蛇头
			var head;
			switch(direction){
				case "u":
					head = {x:(snakeBody[0].x),y:(snakeBody[0].y-1)};
				break;
				case "d":
					head = {x:(snakeBody[0].x),y:(snakeBody[0].y+1)};
				break;
				case "r":
					head = {x:(snakeBody[0].x+1),y:(snakeBody[0].y)};
				break;
				case "l":
					head = {x:(snakeBody[0].x-1),y:(snakeBody[0].y)};
				break;
			}
			snakeBody.unshift(head);
			if(!isAlive()){
				if(confirm("Game over!\nPlay again?")){
					grid.clear();
					init();
				}
				return;
			}
			
			grid.drawDot(snakeBody[0].x,snakeBody[0].y);
			
			
			
			// 判断吃食物 处理蛇尾
			if(head.x==food.x&&head.y==food.y){
				// 生成食物
				food = createFood();
				// 提速
				speed > minSpeed ? speed -= 50 : speed;
				clearInterval(interval);
				interval = setInterval(forward.bind(obj), speed);
			}
			else{
				var tail = snakeBody.pop();
				grid.easeDot(tail.x, tail.y);
			}
		};

		/**
		 *=======初始化========
		 * 初始化工作
		 *====================
		 */
		var init = function(){
			direction = "r";
			snakeBody = new Array();
			food = createFood();
			
			// 初始化蛇身
			for(var i=0; i < length; i++){
				snakeBody.unshift({x:i,y:0});
				grid.drawDot(i, 0);
			}			

			// 监听按键并加入操作队列
			document.onkeydown = function(e){
				var e = e || window.event;
				e.preventDefault();
				if(!directions[e.keyCode]) return;
				var opreation = directions[e.keyCode];
				if(opreations[0]!=opreation.opreation&&opreations[0]!=opreation.oppsite&&(opreations[0]||direction!=opreation.oppsite)){
					opreations.unshift(opreation.opreation);
				}
			}
			
			// 定时器
			interval = setInterval(forward.bind(obj), speed);
		};
		
		init();
		
		return obj;
	}
}

return {Snake:Snake, Grid:Grid};

})();

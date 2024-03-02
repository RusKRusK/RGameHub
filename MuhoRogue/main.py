import pyxel

# タイル
TILE_FLOOR = ((1,0),(2,0))
TILE_WALL = ((0,1),(1,1))
TILE_STAIR = (0,2)
TILE_DOOR = (1,2)
TILE_CHEST = (0,3)
TILE_HERB = (1,3)
TILE_SIGN = (0,4)
COL_T = 0

# 右左下上
RIGHT = (pyxel.KEY_RIGHT, pyxel.KEY_D, pyxel.GAMEPAD1_BUTTON_DPAD_RIGHT)
LEFT = (pyxel.KEY_LEFT, pyxel.KEY_A, pyxel.GAMEPAD1_BUTTON_DPAD_LEFT)
DOWN = (pyxel.KEY_DOWN, pyxel.KEY_S, pyxel.GAMEPAD1_BUTTON_DPAD_DOWN)
UP = (pyxel.KEY_UP, pyxel.KEY_W, pyxel.GAMEPAD1_BUTTON_DPAD_UP)
key_dir = (RIGHT, LEFT, DOWN, UP)

dir_x = (1, -1, 0, 0)
dir_y = (0, 0, 1, -1)

# オブジェクトのリスト
# (enemies以外不要かも それ用のクラスを作るかどうか)
enemies = []
chests = []
herbs = []
stairs = []

# サウンドの番号
SND_STEP = 63
SND_WALL = 62
SND_GET = 61
SND_CONV = 60
SND_DAMAGE = 59
SND_DEATH = 58
SND_DOOR = 57
SND_STAIR = 56


# タイル関連の関数
def get_tile(tile_x, tile_y):
	return pyxel.tilemaps[0].pget(tile_x, tile_y)

def set_tile(tile_x, tile_y, tile):
	return pyxel.tilemaps[0].pset(tile_x, tile_y, tile)

# タイルからオブジェクトの配置を行う関数
def spawn_obj():
	for y in range(pyxel.height / 8):
		for x in range(pyxel.width / 8):
			tile = get_tile(x,y)
#			if tile == TILE_CHEST:
#				chests.append(chest(x * 8, y * 8))

# テキストボックスを出す関数
def draw_textbox(x, y, w, h, t):
	pyxel.rect(x, y, w, h, 0)
	pyxel.rectb(x, y, w, h, 7)
	pyxel.text(x+3, y+3, t, 7)

# テキストボックスの親クラス
class textbox:
	def __init__(self, x, y, w, h, txt, type, lim):
		self.x, self.y, self.w, self.h, self.txt, self.type, self.lim = x, y, w, h, txt, type, lim
		self.time = 0
		self.ox = self.oy = 0
	def update(self):
		self.time += 1
		if self.type == -1:
			pass
		elif 0 <= self.type < 4:
			pass
	
	def draw(self):
		draw_textbox(self.x, self.y, self.w, self.h, self.txt)



# プレイヤークラス
class player:
	def __init__(self, x, y):
		# 座標
		self.x, self.y = x, y
		# 入力用のバッファ
		self.key_buf = -1
		# アニメーション用
		self.ox = self.oy = 0
		self.sox = self.soy = 0
		self.time = 0
		self.t = 0
		# 見た目上の向き
		self.face = 2
		
		self.upd = self.update_game
	
	def update(self):
		self.upd()
		self.time += 1
	
	def draw(self):
		pyxel.blt(self.x * 8 + self.ox, self.y * 8 + self.oy, 2, \
		16 * self.face + 8 * ((self.time // 20) % 2), 0, 8, 8, COL_T)
	
	def update_game(self):
		for i in range(4):
			# 移動の処理
			if self.move(i): # キーが押されたら終了
				break
	
	def update_turn(self):
		self.t = min(self.t+0.125, 1)
		self.ox = self.sox * (1-self.t)
		self.oy = self.soy * (1-self.t)
		if self.t == 1:
			self.upd = self.update_game
		
		for i in range(len(key_dir)):
			for j in range(len(key_dir[i])):
				if pyxel.btnp(key_dir[i][j]):
					self.key_buf = key_dir[i][j]
					break
	
	def update_bump(self):
		self.t = min(self.t+0.125, 1)
		pos = 0.75 * (0.5-abs(0.5-self.t))
		self.ox = self.sox * pos
		self.oy = self.soy * pos
		if self.t == 1:
			self.upd = self.update_game
		
		for i in range(len(key_dir)):
			for j in range(len(key_dir[i])):
				if pyxel.btnp(key_dir[i][j]):
					self.key_buf = key_dir[i][j]
					break


	def move(self, i):
		dest_x, dest_y = self.x + dir_x[i], self.y + dir_y[i]
		dest_tile = get_tile(dest_x, dest_y)
		for j in range(len(key_dir[i])):
			if pyxel.btn(key_dir[i][j]) or self.key_buf == key_dir[i][j]:
				self.face = i
				self.key_buf = -1
				if dest_tile in TILE_WALL: # 壁の処理
					self.set_o(i, 1, 1, 0, 0)
					pyxel.play(3, SND_WALL)
					self.upd = self.update_bump
					
				elif dest_tile == TILE_DOOR: # ドア
					self.set_o(i, 1, 1, 0, 0)
					set_tile(dest_x, dest_y, TILE_FLOOR[0])
					pyxel.play(3, SND_DOOR)
					self.upd = self.update_bump
					
				elif dest_tile == TILE_CHEST: # 宝箱
					self.set_o(i, 1, 1, 0, 0)
					set_tile(dest_x, dest_y, TILE_FLOOR[0])
					pyxel.play(3, SND_GET)
					self.upd = self.update_bump
					
				elif dest_tile == TILE_HERB: # 薬草
					self.x, self.y = dest_x, dest_y
					self.set_o(i, -1,-1,-1,-1)
					set_tile(dest_x, dest_y, TILE_FLOOR[0])
					pyxel.play(3, SND_GET)
					self.upd = self.update_turn
				
				# elif dest_tile == TILE_SIGN: # 看板
				# 	self.set_o(i, 1, 1, 0, 0)
				# 	pyxel.play(3, SND_CONV)
				# 	self.upd = self.update_bump
				
				else:
					self.x, self.y = dest_x, dest_y
					self.set_o(i, -1,-1,-1,-1)
					pyxel.play(2, SND_STEP)
					self.upd = self.update_turn
				
				self.t = 0
				return True
			
		return False
	
	def set_o(self, i, sox, soy, ox, oy):
		self.sox, self.soy = sox * dir_x[i] * 8, soy * dir_y[i] * 8 
		self.ox, self.oy = ox * dir_x[i] * 8, oy * dir_y[i] * 8 
		

# メインのクラス
class App:
	def __init__(self):
		pyxel.init(128, 128, title="NjoguGeorgeMuhoroguelike", fps=60)
		pyxel.load("./resauce.pyxres")
		pyxel.images[1].blt(0, 0, 0, 0, 8 * 2, 8 * 5, 8 * 5)
		for y in range(5):
			for x in range(5):
				pyxel.images[0].blt(x * 8, 16 + y * 8, 0, 8, 0, 8, 8)
				pyxel.images[0].blt(x * 8, 16 + y * 8, 1, x * 8, y * 8, 8, 8, COL_T)
		pyxel.images[0].blt(TILE_SIGN[0] * 8, TILE_SIGN[1] * 8, 0, 8, 0, 8, 8)
		self.upd = self.update_game
		self.drw = self.draw_game
		global player
		player = player(2, 2)
		pyxel.run(self.update, self.draw)

	def update(self):
		self.upd()

	def draw(self):
		self.drw()

	# 通常のupdate処理
	def update_game(self):
		
		# プレイヤーの処理
		player.update()

	def draw_game(self):
		pyxel.cls(0)
		# タイルマップ描画
		pyxel.bltm(0, 0, 0, 0, 0, 128, 128, COL_T)
		
		# プレイヤーの描画
		player.draw()
		
		# draw_textbox(10,10,53,17,"test message\n line 2")


# ゲームオーバー時
	def update_gameover(self):
		pass

	def draw_gameover(self):
		pyxel.cls(1)

App()
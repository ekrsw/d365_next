import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import tkinter as tk
from tkinter import filedialog
import urllib.parse
import html
import os
from datetime import datetime
import sys

from config import settings

# UTF-8出力設定
sys.stdout.reconfigure(encoding='utf-8')

# GUI初期化（最前面）
root = tk.Tk()
root.withdraw()
root.attributes('-topmost', True)

# Excelファイル選択
excel_file_path = filedialog.askopenfilename(
	title='Excelファイルを選択してください',
	filetypes=[('Excel files', '*.xlsx *.xls')],
	defaultextension='.xlsx'
)

if not excel_file_path:
	print("ファイルが選択されませんでした。処理を終了します。")
	exit()

# Excel読み込み
try:
	df_excel = pd.read_excel(excel_file_path)
except Exception as e:
	print(f"Excelファイルの読み込みに失敗しました: {e}")
	exit()

# 「記事」列を検出
article_column_name = next((col for col in df_excel.columns if '記事' in str(col)), None)
if not article_column_name:
	print("「記事」列が見つかりませんでした。")
	exit()

# 出力用データフレームの初期化
df_output = pd.DataFrame(columns=[
	'番号', '記事', '記事番号', 'タイトル', 'キーワード',
	'公開開始', '公開終了', '質問', '回答', '追加コメント',
	'情報カテゴリ', '対象'
])

# Selenium起動
options = webdriver.ChromeOptions()
options.add_argument('--headless')

# sampleプログラム互換：環境変数設定
if hasattr(settings, 'HTTP_PROXY') and settings.HTTP_PROXY:
    os.environ['HTTP_PROXY'] = settings.HTTP_PROXY
    os.environ['http_proxy'] = settings.HTTP_PROXY
    
if hasattr(settings, 'HTTPS_PROXY') and settings.HTTPS_PROXY:
    os.environ['HTTPS_PROXY'] = settings.HTTPS_PROXY
    os.environ['https_proxy'] = settings.HTTPS_PROXY

if hasattr(settings, 'NO_PROXY') and settings.NO_PROXY:
    # localhost と 127.0.0.1 を追加
    no_proxy_list = settings.NO_PROXY.split(',')
    if 'localhost' not in no_proxy_list:
        no_proxy_list.append('localhost')
    if '127.0.0.1' not in no_proxy_list:
        no_proxy_list.append('127.0.0.1')
    no_proxy = ','.join(no_proxy_list)
    os.environ['NO_PROXY'] = no_proxy
    os.environ['no_proxy'] = no_proxy
else:
    # NO_PROXYが設定されていない場合でもlocalhostは除外
    os.environ['NO_PROXY'] = 'localhost,127.0.0.1'
    os.environ['no_proxy'] = 'localhost,127.0.0.1'

# プロキシ設定
# NO_PROXYの設定（環境変数から取得）
no_proxy = os.environ.get('NO_PROXY', 'localhost,127.0.0.1')
options.add_argument(f'--proxy-bypass-list={no_proxy}')

if hasattr(settings, 'HTTP_PROXY') and settings.HTTP_PROXY:
    options.add_argument(f'--proxy-server={settings.HTTP_PROXY}')
elif hasattr(settings, 'PROXY_HOST') and settings.PROXY_HOST and hasattr(settings, 'PROXY_PORT') and settings.PROXY_PORT:
    proxy_server = f"{settings.PROXY_HOST}:{settings.PROXY_PORT}"
    options.add_argument(f'--proxy-server={proxy_server}')
else:
    # プロキシを使用しない設定
    options.add_argument('--no-proxy-server')

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
wait = WebDriverWait(driver, 30)

# 初期URLにアクセス
initial_url = 'http://sv-vw-ejap:5555/SupportCenter/main.aspx?area=nav_answers&etc=127&page=CS&pageType=EntityList&web=true'
try:
	driver.get(initial_url)
except Exception as e:
	print(f"初期URLへのアクセスに失敗しました: {e}")
	driver.quit()
	exit()

# 各行の処理
for index, row in df_excel.iterrows():
	article_id = row[article_column_name]
	guid = f'{{{article_id}}}'
	encoded_guid = urllib.parse.quote(guid, safe='').lower()
	extraqs_raw = f'?etc=127&id={encoded_guid}'
	extraqs_encoded = urllib.parse.quote(extraqs_raw, safe='').lower()
	detail_url = f'http://sv-vw-ejap:5555/SupportCenter/main.aspx?etc=127&extraqs={extraqs_encoded}&newWindow=true&pagetype=entityrecord#635740545'
	print(f"アクセスURL: {detail_url}")

	try:
		driver.get(detail_url)
		wait.until(EC.presence_of_element_located((By.TAG_NAME, 'iframe')))
		iframe = driver.find_element(By.TAG_NAME, 'iframe')
		driver.switch_to.frame(iframe)

		def safe_get_value(by, value):
			try:
				return wait.until(EC.presence_of_element_located((by, value))).get_attribute("value")
			except:
				return ""

		article_no = safe_get_value(By.ID, "number")
		title = safe_get_value(By.ID, "title")
		keywords = safe_get_value(By.ID, "keywords")

		def get_open_period(id_name):
			try:
				container = wait.until(EC.presence_of_element_located((By.ID, id_name)))
				input_elem = container.find_element(By.CSS_SELECTOR, "input.ms-crm-Input")
				return input_elem.get_attribute("value") if input_elem else ""
			except:
				return ""

		open_start = get_open_period("enjoy_openperiod_start_d")
		open_end = get_open_period("enjoy_openperiod_end_d")

		try:
			content_html_encoded = wait.until(EC.presence_of_element_located((By.ID, "content"))).get_attribute("value")
			content_html = html.unescape(content_html_encoded)
			soup = BeautifulSoup(content_html, 'html.parser')

			def extract_section(section_title):
				header = soup.find('td', string=lambda s: s and section_title in s.strip())
				if header and (header_row := header.find_parent('tr')):
					if content_row := header_row.find_next_sibling('tr'):
						if content_td := content_row.find('td'):
							return content_td.get_text(separator="\n", strip=True)
							#return content_td.get_text(strip=True) #改行を含めない
				return ""

			question = extract_section("質問")
			answer = extract_section("回答")
			comments = extract_section("追加コメント")
		except Exception as e:
			question = answer = comments = ""
			print(f"HTML解析エラー: {e}")

		try:
			category_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "span.ms-crm-LookupItem-Name")))
			category = category_element.text.strip()
		except:
			category = ""

		try:
			mjs_target_element = wait.until(EC.presence_of_element_located((By.ID, "mjs_target")))
			selected_option = mjs_target_element.find_element(By.CSS_SELECTOR, "option[selected]")
			mjs_target_text = selected_option.text.strip()
		except:
			mjs_target_text = ""

		driver.switch_to.default_content()

		new_row = {
			'番号': row.get('番号', ''),
			'記事': article_id,
			'記事番号': article_no,
			'タイトル': title,
			'キーワード': keywords,
			'公開開始': open_start,
			'公開終了': open_end,
			'質問': question,
			'回答': answer,
			'追加コメント': comments,
			'情報カテゴリ': category,
			'対象': mjs_target_text
		}
		df_output = pd.concat([df_output, pd.DataFrame([new_row])], ignore_index=True)

	except Exception as e:
		print(f"記事ID {article_id} の処理中にエラーが発生しました: {e}")
		new_row = {
			'番号': row.get('番号', ''),
			'記事': article_id,
			'記事番号': '',
			'タイトル': 'エラー発生',
			'キーワード': '',
			'公開開始': '',
			'公開終了': '',
			'質問': '',
			'回答': '',
			'追加コメント': '',
			'情報カテゴリ': '',
			'対象': ''
		}
		df_output = pd.concat([df_output, pd.DataFrame([new_row])], ignore_index=True)

# ブラウザ終了
driver.quit()

# 結果保存
formatted_datetime = datetime.now().strftime('%Y_%m%d_%H%M%S')
output_directory = os.path.dirname(excel_file_path)
output_filename = f'{formatted_datetime}_output.xlsx'
output_path = os.path.join(output_directory, output_filename)

try:
	writer = pd.ExcelWriter(output_path, engine='xlsxwriter')
	df_output.to_excel(writer, index=False)

	workbook = writer.book
	worksheet = writer.sheets['Sheet1']
	font_format = workbook.add_format({'font_name': '游ゴシック'})

	for i, col in enumerate(df_output.columns):
		worksheet.set_column(i, i, None, font_format)

	writer.close()
	print(f"処理が完了しました。結果は以下のファイルに保存されました: {output_path}")
except Exception as e:
	print(f"結果のExcelファイル書き込み中にエラーが発生しました: {e}")
	
input("処理が完了しました。Enterキーを押して終了します...")

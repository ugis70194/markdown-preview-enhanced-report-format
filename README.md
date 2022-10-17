## Markdown Preview Enhanced report format

[Visual Studio Code](https://code.visualstudio.com/),[Atom](https://atom.io/)の拡張機能[Markdown Preview Enhanced](https://github.com/shd101wyy/markdown-preview-enhanced)の拡張スクリプトです。  
図,表,式の番号を自動で振る、参照を自動で振るなどMarkdownをレポートに特化したフォーマットに自動で変換します。  


[Markdown Preview Enhanced](https://github.com/shd101wyy/markdown-preview-enhanced)の機能についてはこちらを参照してください。  

[Markdown Preview Enhanced 日本語ドキュメント](https://shd101wyy.github.io/markdown-preview-enhanced/#/ja-jp/)

## 導入方法
Previewを一度以上開いた後、`Ctrl-Shift-P`を押して、    
`Markdown Preview Enhanced：Extend Parser`コマンドを実行します。   
次に、このリポジトリの`parser.js`ファイルの内容を開かれた`parser.js`ファイルのコピー＆ペーストしてください。
  
同様に、`Markdown Preview Enhanced: Customize Css`コマンドを実行します。   
次に、このリポジトリの`style.less`ファイルの内容を開かれた`style.less`ファイルのコピー＆ペーストしてください。

## ドキュメント

### 表紙を作成する

表紙をつけるには、以下のようにフロントマターをファイルの先頭に書きます。  
明示的に設定していない項目は表示されません。  

#### input

```
^^^cover
title: タイトル
subtitle: サブタイトル
sub_date: 提出日
exp_date: 実験日
subject: 授業科目
teacher: 担当教員
number: 学籍番号
name: 氏名
depart: 学科
collab: 共同実験者
desk: 使用デスク
^^^
```

#### output

![](./img/cover.jpg)

### 目次を作成する

自動でやってくれます。  

#### input

```
## section 1
### sub section 1
### sub section 2
#### sub sub section 1
## section 2
```

#### output

![](./img/toc.jpg)

### 画像にキャプションをつける

`[]`の中にキャプションテキストを書きます。    

```
![ここにキャプションを書く](src)
```

![](./img/img_caption.jpg)

### 画像のレイアウトを変更する
#### flex

`<flex>`要素で囲むと画像を回り込むように表示します。  

```
<flex>
  ![](./img/image_hoso.svg)
  ![](./img/image_hoso.svg)
<flex>
```

![](./img/img_flex.jpg)

#### grid

`<grid>`要素で囲むことで画像をグリッド状に表示します。  
columnsの数は`<grid col:n>`のように指定します。rowは無限です。

#### input

```
<grid col:2>
  ![](./img/img_hoso.jpg)
  ![](./img/img_hoso.jpg)

  ![](./img/img_hoso.jpg)
  ![](./img/img_hoso.jpg)
</grid>
```

#### output

![](./img/img_grid.jpg)

### 表にキャプションをつける

表の直下に書いたテキストが表のキャプションとして扱われます。  

#### input

```
|x|1|2|3|
|--|--|--|--|
|1|1|2|3|
|2|2|4|6|
|3|3|6|9|
掛け算表 3x3
```
#### output

![](./img/table.jpg)


### プログラムにキャプションをつける

コードブロックの直下に書いたテキストがプログラムのキャプションとして扱われます。  

#### input

<span>
```
<br>
console.log("ok")
<br>
```
ok
</span>

#### output

![](./img/code.jpg)


### 図,表,プログラム, 式に番号をふる

文書の先頭からそれぞれ自動に番号が振られます。  

#### input

```
![](./img/image.jpg)
![](./img/image.jpg)

$$ E = mc^2 $$
```

#### output

![](./img/index.jpg)

### ラベルを貼る & 参照する

`<label>`要素を`<ref>`要素を使って参照することができます。  
`<lable>`要素には4つの属性があり、`fig`,  `tbl`, `prg`, `frm` を指定できます。順に図,表,プログラム, 式に対応しています。   
`<label fig:firstimage>`のように名前をつけることができます。  
`fig`を属性に指定した場合、文書の先頭からn番目の`<label fig>`要素が対応するのは文書の先頭からn番目の画像です。  

`<ref>`要素は`<ref fig:firstimage>`のように記述すると`図x`の形で`<label fig:firstimage>`を参照することができます。  

#### input

```
![](./img/image.jpg)
<label fig:image>

<ref fig:image>を参照。
```

#### output

![](./img/label_ref.jpg)

### 改ページする

`<newpage>`要素を文書中に挿入することでpdfに変換したとき、その位置で改ページされます。

#### input

```
ここで改ページ
<newpage>
ここから新しいページ
```

#### output

![](./img/newpage.jpg)

### 設定を変更する

キャプションをつけないようにするなど設定を変更したい場合は、以下のようにフロントマターをファイルの先頭に書きます。  

現在対応している項目は以下です。  
|項目|内容|
|--|--|
|toc|目次の自動作成|
|cap_img|画像のキャプション付与|
|cap_tbl|テーブルのキャプション付与|
|cap_prg|プログラムのキャプション付与|
|draw_space|全角スペースの表示|

#### input

```
^^^settings
toc: true
cap_img: false
cap_tbl: false
cap_prg: false
draw_space: true
^^^
```

#### output

![](./img/settings.jpg)
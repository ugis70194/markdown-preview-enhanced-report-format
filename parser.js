module.exports = {
  onWillParseMarkdown: function(markdown) {
    return new Promise((resolve, reject)=> {

      var ImageNum = 0;
      var FormulaNum = 0;

      // 目次の生成
      let mokuji = true;
      let contents = "<h2>目次</h2>\n<ul>\n"
      let sectionCount = new Array(0,0,0,0,0,0);
      let markdown_line = markdown.split('\n');
      let ireko = 0;

      const setContentTable = (level, line_num) => {
        if(line_num >= markdown_line.length){
          while(ireko --> 0) contents += "</ul>\n";
          return;
        }
        if(level >= 6){
          setContentTable(2, line_num+1);
        }

        const h = '#'.repeat(level) + ' ';
        if(markdown_line[line_num].startsWith(h)){
          for(let chl_level = 5; chl_level >= level; chl_level--){
            if(chl_level != level && sectionCount[chl_level] > 0 && ireko > 0){
              contents += "</ul>\n";
              ireko--;
            }
            if(chl_level === level && level > 2 && sectionCount[chl_level] === 0){
              contents += "<ul>\n";
              ireko++;
            }
          }

          // content += <li class="h2"><a href=#item-${++sectionCount[2]} style="color: black;"> ${sectionCount[2]}. ${markdown_line[line_num].substr(3)}</a>\n</li>`
          // markdown_line[line_num] = `<h2 id=item-${sectionCount[2]}>${sectionCount[2]}. ${markdown_line[line_num].substr(3)}</h2>`;

          let tag = "item";
          let sectionTitle = "";
          for(let nest = 2; nest <= level; nest++){
            if(nest == level) sectionCount[nest] += 1;
            tag += `-${sectionCount[nest]}`;
            sectionTitle += `${sectionCount[nest]}.`
          }
          sectionTitle += ` ${markdown_line[line_num].substr(level+1)}`;

          contents += `<li class=h${level}>`;
          contents += `<a href=#`;
          contents += tag;
          contents += ` style="color: black;">`;
          contents += sectionTitle;
          contents += "</a></li>\n";
          markdown_line[line_num] = `<h${level} id=item${tag}> ${sectionTitle}</h${level}>`;
          for(let i = level+1; i < 6; i++) sectionCount[i] = 0;

          setContentTable(2, line_num+1);
        }else{
          setContentTable(level+1, line_num);
        }
        return;
      }
      setContentTable(2, 0);
      
      contents += '</ul>\n<div class="newpage"></div>\n'
      if(!mokuji) contents = "";
      markdown = contents + markdown_line.join('\n');

      markdown = markdown.replace(/図(\d+)/gm,
      (whole, number) => 
      `<a href=#fig${number} class="ref">図${number}</a>`
      );

      markdown = markdown.replace(/表(\d+)/gm,
      (whole, number) => 
      `<a href=#table${number} class="ref">表${number}</a>`
      );

      markdown = markdown.replace(/式(\d+)/gm,
      (whole, number) => 
      `<a href=#formula${number} class="ref">式${number}</a>`
      );

      markdown = markdown.replace(/プログラム(\d+)/gm,
      (whole, number) => 
      `<a href=#program${number} class="ref">プログラム${number}</a>`
      );

      markdown = markdown.replace(/\$\$\s*\n*(.*?)\s*\n*\$\$/gm, 
      (whole, formula) => 
      `<a name="formula` + String(++FormulaNum) + `"></a>\n` + 
      `\$\$ ${formula} \\tag{` + String(FormulaNum) + `} \$\$`
      );
    
      markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/gm, 
      (whole, caption, url) =>
      `<a name="fig` + String(++ImageNum) + `"></a>\n` + 
      `<figure class=image>\n`+
      `  <img class=image src="${url}"/>\n`+
      `  <figcaption>図` + String(ImageNum) + `. ${caption}</figcaption>\n`+
      `</figure>\n`
      );
      
      markdown = markdown.replaceAll("　", "&#x3000;")

      try {
        var reg = new RegExp(/\^\^\^cover\s+(.*?)\^\^\^/s);
        var content = reg.exec(markdown)[1];
        var options = new Object();
    
        const optionsLable = 
        ["sub_date", "title", "subtitle", 
        "exp_date", "subject", "teacher", 
        "number", "name", "depart","collab","desk"]
    
        const trans = {
            title: "",
            subtitle: "",
            sub_date: "提出日: ",
            exp_date: "実験日　　: ",
            subject : "授業科目　: ",
            teacher : "担当教員　: ",
            number  : "学籍番号　: ",
            name    : "氏名　　　: ",
            depart  : "学科　　　: ", 
            collab  : "共同実験者: ",
            desk    : "使用デスク: ",
        }
    
        var replaceStr = ""

        for (const label of optionsLable){
            var query = "(?<!.)" + label + ":(.*)";
        
            try {
              options[label] = RegExp(query).exec(content)[1];
            } catch(err) {
              options[label] = "";
            }
        }
    
        for (const label of optionsLable){
            if(options[label] === ""){
              replaceStr += "<p class=" + label + " none></p>\n";
            }else{
              replaceStr += "<p class=" + label + ">" + trans[label] + options[label] +"</p>\n";
            }
        }
        
        replaceStr += "<div class=newpage></div>";
        let cover = replaceStr;

        markdown = markdown.replace(/\^\^\^cover\s+(.*?)\^\^\^/sgm, (whole, content) => "");
        markdown = cover + markdown;
    } catch(err){}

      return resolve(markdown)
    })
  },
  onDidParseMarkdown: function(html, {cheerio}) {
    return new Promise((resolve, reject)=> {
      var TableNum = 0;
      let programNum = 0;

      html = html.replace(/\<\/table\>\n\<p\>(.*?)\<\/p\>/gm, 
      (whole, cap) => 
      `<a name="table` + String(++TableNum) + `"></a>` +
      `</table>\n`+
      `<p class=caption>表` + String(TableNum) + `. ${cap}</p>`
      );
      //html = html.replace(/\<\/pre\>\<p\>(.*?)\<\/p\>/gm,
      //(whole, cap) => 
      //`<a name="program` + String(++programNum) + `"></a>` +
      //`</pre>\n`+
      //`<p class=caption>プログラム` + String(programNum) + `. ${cap}</p>`);

      return resolve(html)
    })
  },
  onWillTransformMarkdown: function (markdown) {
        return new Promise((resolve, reject) => {
            return resolve(markdown);
        });
    },
  onDidTransformMarkdown: function (markdown) {
      return new Promise((resolve, reject) => {
          return resolve(markdown);
      });
  }
}

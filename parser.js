module.exports = {
    onWillParseMarkdown: function(markdown) {
      return new Promise((resolve, reject)=> {
        var ImageNum = 0;
        var FormulaNum = 0;
  
        markdown = markdown.replace(/図(\d+)/gm,
        (whole, number) => 
        `[図${number}](#fig${number})`
        );
  
        markdown = markdown.replace(/表(\d+)/gm,
        (whole, number) => 
        `[表${number}](#table${number})`
        );
  
        markdown = markdown.replace(/式(\d+)/gm,
        (whole, number) => 
        `[式${number}](#formula${number})`
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
  
        try {
          var reg = new RegExp(/\^\^\^cover\s+(.*?)\^\^\^/s);
          var content = reg.exec(markdown)[1];
          var options = new Object();
      
          const optionsLable = 
          ["sub_date", "subtitle", "title", 
          "exp_date", "subject", "teacher", 
          "number", "name", "collab","desk"]
      
          const trans = {
              title: "",
              subtitle: "",
              sub_date: "提出日: ",
              exp_date: "実験日　　: ",
              subject : "授業科目　: ",
              teacher : "担当教員　: ",
              number  : "学籍番号　: ",
              name    : "氏名　　　: ",
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
  
          markdown = markdown.replace(/\^\^\^cover\s+(.*?)\^\^\^/sgm, (whole, content) => replaceStr);
      
      } catch(err){}
  
        return resolve(markdown)
      })
    },
    onDidParseMarkdown: function(html, {cheerio}) {
      return new Promise((resolve, reject)=> {
        var TableNum = 0;
  
        html = html.replace(/\<\/table\>\n\<p\>(.*?)\<\/p\>/gm, 
        (whole, cap) => 
        `<a name="table` + String(++TableNum) + `"></a>` +
        `</table>\n`+
        `<p class=caption>表` + String(TableNum) + `. ${cap}</p>`
        );
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
  
import os
import re
from xpinyin import Pinyin

FileDir = r"D:\在线";
    
pYin = Pinyin()
records = open(FileDir+r"\在线.txt", "w")

    
for root,dirs,files in os.walk(FileDir):
    for file in files:
        if file != '在线.txt':
            try:
                path = os.path.join(root,file)
                
                ret = pYin.get_pinyin(file, ' ', tone_marks='marksx').title()
                ret=re.sub(r' {2,}','',ret);
                ret=re.sub(r'[0-9]','',ret);
                ret = re.sub(r"[^ -~\u4E00-\u9FFF]", "", ret).strip()
                ret=ret.replace('Zai Xian Bo Fang', '').strip()
                ret=ret.replace(' ', '_')
                ret=ret.replace('：', '')
                ret = ret[:72]
                ret = ret+'['+str(int(os.path.getsize(path)/1024/1024))+'].rar'
                
                records.write(file);
                records.write('\n');
                records.write(ret);
                records.write('\n');
                records.write('\n');
                records.flush()
                
                print(path)
                print()
                os.rename(path, os.path.join(root,ret))
            except Exception as e:
                print(e)

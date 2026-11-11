from pathlib import Path
from io import BytesIO
from html import escape
from docx import Document
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph as WordParagraph
from docx.table import Table as WordTable
from reportlab.platypus import SimpleDocTemplate, Paragraph, Image, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage
import pypdfium2 as pdfium

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'manuales'/'version_ampliada'
QA=ROOT/'tmp'/'manuales-qa'
QA.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('ArialLocal','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold','C:/Windows/Fonts/arialbd.ttf'))
body=ParagraphStyle('body',fontName='ArialLocal',fontSize=10,leading=14,spaceAfter=7)
styles={
 'Title':ParagraphStyle('title',fontName='ArialBold',fontSize=22,leading=27,alignment=TA_CENTER,spaceBefore=18,spaceAfter=16),
 'Heading 1':ParagraphStyle('h1',fontName='ArialBold',fontSize=15,leading=19,spaceBefore=14,spaceAfter=7,keepWithNext=True),
 'Heading 2':ParagraphStyle('h2',fontName='ArialBold',fontSize=12,leading=15,spaceBefore=10,spaceAfter=5,keepWithNext=True),
 'Normal':body,
 'List Bullet':ParagraphStyle('bullet',parent=body,leftIndent=16,firstLineIndent=-10),
 'Caption':ParagraphStyle('caption',parent=body,fontSize=9,alignment=TA_CENTER),
}

def footer(canvas,doc):
 canvas.setFont('ArialLocal',8);canvas.setFillColor(colors.grey);canvas.drawRightString(letter[0]-50,25,'JME | Página '+str(doc.page))

def convert(name):
 src=OUT/(name+'.docx');d=Document(src);doc=SimpleDocTemplate(str(OUT/(name+'.pdf')),pagesize=letter,leftMargin=58,rightMargin=58,topMargin=55,bottomMargin=50,title=name.replace('_',' '))
 story=[]
 for element in d.element.body:
  if element.tag==qn('w:p'):
   p=WordParagraph(element,d);txt=p.text.strip();style=p.style.name
   if txt=='Actualice el índice en Word si es necesario.':
    headings=[x.text for x in d.paragraphs if x.style.name in ('Heading 1','Heading 2') and x.text not in ('Control del documento','Contenido')]
    for h in headings:story.append(Paragraph(escape(h),ParagraphStyle('toc',parent=body,fontSize=8.3,leading=10.5,spaceAfter=0.5,leftIndent=12 if h.count('.') else 0)))
   elif txt:
    chosen=styles.get(style,body)
    if style=='List Bullet':txt='• '+txt
    story.append(Paragraph(escape(txt).replace('\n','<br/>'),chosen))
   for blip in element.xpath('.//a:blip'):
    rid=blip.get(qn('r:embed'))
    if rid:
     blob=d.part.related_parts[rid].blob; image=PILImage.open(BytesIO(blob)); w,h=image.size
     width=min(480,480*float(w)/max(w,1));height=width*h/w
     if height>390:width*=390/height;height=390
     story.append(Image(BytesIO(blob),width=width,height=height,hAlign='CENTER'))
   if element.xpath('.//w:br[@w:type="page"]'):story.append(PageBreak())
  elif element.tag==qn('w:tbl'):
   table=WordTable(element,d);rows=[[Paragraph(escape(c.text),ParagraphStyle('cell',parent=body,fontSize=8.5,leading=11,spaceAfter=0,textColor=colors.white if i==0 else colors.black)) for c in row.cells] for i,row in enumerate(table.rows)]
   if rows:
    t=Table(rows,colWidths=[(letter[0]-116)/len(rows[0])]*len(rows[0]),repeatRows=1,hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#17365D')),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#D9D9D9')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story.extend([t,Spacer(1,8)])
 grouped=[];i=0
 while i<len(story):
  if isinstance(story[i],Image) and i+1<len(story) and isinstance(story[i+1],Paragraph) and story[i+1].getPlainText().startswith('Figura.'):
   grouped.append(KeepTogether([story[i],story[i+1]]));i+=2
  else:grouped.append(story[i]);i+=1
 doc.build(grouped,onFirstPage=footer,onLaterPages=footer)
 pdf=pdfium.PdfDocument(str(OUT/(name+'.pdf')))
 out=QA/name;out.mkdir(parents=True,exist_ok=True)
 for i in range(len(pdf)):
  page=pdf[i];page.render(scale=1.0).to_pil().save(out/('page-%02d.png'%(i+1)));page.close()
 print(name,'páginas',len(pdf));pdf.close()

for n in ('Manual_usuario_ampliado','Manual_tecnico_ampliado'):convert(n)

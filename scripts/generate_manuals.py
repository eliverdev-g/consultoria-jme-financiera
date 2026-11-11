from pathlib import Path
from datetime import date
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "manuales"
IMG = ROOT / "tmp-reference"
OUT.mkdir(exist_ok=True)

SCREENSHOTS = [
    (IMG / "page-1-0.png", "Panel de reportes", "Presenta cartera vencida total, clientes morosos, recuperacion, rangos de mora, recuperacion mensual y distribucion por estado."),
    (IMG / "page-1-1.png", "Administracion de usuarios", "Permite consultar cuentas, roles, estado de acceso y permisos por modulo."),
    (IMG / "page-2-0.png", "Gestion de clientes", "Centraliza identificacion, saldo, dias de mora, segmentacion, gestor asignado y acciones disponibles."),
    (IMG / "page-2-1.png", "Convenios de pago", "Permite revisar convenios, saldo acordado, cuotas, proxima fecha y estado de cumplimiento."),
    (IMG / "page-3-0.png", "Seguimiento de gestiones", "Registra llamadas, WhatsApp, visitas y correos; mantiene el historial y la proxima accion."),
]

BLUE = "17365D"
LIGHT = "EAF2F8"
GRAY = "666666"

def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tcPr.append(shd)

def set_cell_text(cell, text, bold=False, color="000000", size=9):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(str(text))
    r.bold = bold
    r.font.size = Pt(size)
    r.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER

def add_table_docx(doc, headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    for i, h in enumerate(headers):
        set_cell_text(table.rows[0].cells[i], h, True, "FFFFFF", 8)
        shade(table.rows[0].cells[i], BLUE)
    for row in rows:
        cells = table.add_row().cells
        for i, value in enumerate(row):
            set_cell_text(cells[i], value, False, "000000", 8)
        if len(table.rows) % 2 == 0:
            for cell in cells:
                shade(cell, "F5F8FA")
    doc.add_paragraph()
    return table

def setup_doc(title):
    d = Document()
    sec = d.sections[0]
    sec.top_margin = Inches(.65); sec.bottom_margin = Inches(.65)
    sec.left_margin = Inches(.7); sec.right_margin = Inches(.7)
    styles = d.styles
    styles["Normal"].font.name = "Aptos"; styles["Normal"].font.size = Pt(10)
    styles["Title"].font.name = "Aptos Display"; styles["Title"].font.size = Pt(24); styles["Title"].font.bold = True; styles["Title"].font.color.rgb = RGBColor.from_string(BLUE)
    for name, size in [("Heading 1",16),("Heading 2",12),("Heading 3",10)]:
        styles[name].font.name = "Aptos"; styles[name].font.size = Pt(size); styles[name].font.bold = True; styles[name].font.color.rgb = RGBColor.from_string(BLUE)
    p = d.add_paragraph(style="Title"); p.add_run(title)
    p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p.add_run("Consultoria Financiera JME Guatemala\n"); r.bold=True; r.font.size=Pt(12); r.font.color.rgb=RGBColor.from_string(BLUE)
    p.add_run(f"Version 1.0 | {date.today().isoformat()} | Sistema de gestion de creditos en mora").font.size = Pt(9)
    d.add_paragraph()
    return d

def add_heading(d, text, level=1): d.add_heading(text, level=level)
def para(d, text, bold_prefix=None):
    p=d.add_paragraph(); p.paragraph_format.space_after=Pt(6)
    if bold_prefix and text.startswith(bold_prefix):
        p.add_run(bold_prefix).bold=True; p.add_run(text[len(bold_prefix):])
    else: p.add_run(text)
    return p
def bullets(d, items):
    for x in items: d.add_paragraph(x, style="List Bullet")
def add_figure(d, path, title, explanation, width=6.5):
    if path.exists():
        p=d.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        p.add_run().add_picture(str(path), width=Inches(width))
        cap=d.add_paragraph(); cap.alignment=WD_ALIGN_PARAGRAPH.CENTER
        rr=cap.add_run(title); rr.bold=True; rr.font.color.rgb=RGBColor.from_string(BLUE)
        para(d, explanation)

def add_footer(d):
    for sec in d.sections:
        p=sec.footer.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER
        p.add_run("JME | Manual del sistema | Uso interno").font.size=Pt(8)

def technical_doc(detailed=True):
    title = "Manual tecnico del sistema" if detailed else "Manual tecnico resumido"
    d=setup_doc(title)
    add_heading(d,"1. Proposito y alcance")
    para(d,"Este manual describe la arquitectura, instalacion, configuracion, base de datos, API, seguridad, mantenimiento y diagnostico del sistema de gestion de cartera en mora de Consultoria Financiera JME. La version resumida concentra solo las tareas necesarias para ponerlo en marcha y operarlo tecnicamente.")
    add_heading(d,"2. Arquitectura de la solucion",1)
    para(d,"La aplicacion es un monolito modular: React y Vite entregan la interfaz; Node.js con Express expone la API; MariaDB almacena clientes, creditos, pagos, convenios, gestiones, alertas y auditoria. Los modulos comparten un proceso, pero separan responsabilidades para facilitar mantenimiento.")
    add_table_docx(d,["Componente","Responsabilidad","Ubicacion"],[("Frontend","Pantallas, formularios, filtros y permisos visibles","src/pages, src/context"),("API","Autenticacion, reglas de negocio y validacion","server/app.ts, server/modules"),("Persistencia","Relaciones, importes en centavos y auditoria","database, server/shared/db.ts"),("Operacion","Migracion, carga inicial, pruebas y documentacion","server/database, server/tests, docs")])
    add_heading(d,"3. Requisitos tecnicos",1)
    bullets(d,["Node.js 22.14 o superior y pnpm.","MariaDB local 10.4 o superior; se recomienda MariaDB 11.4 para instalaciones nuevas.","DBeaver para crear la base y ejecutar scripts SQL.","Navegador actualizado y acceso al puerto 3000 para la interfaz.","Permisos de escritura en el directorio de datos de MariaDB y respaldo periodico."])
    add_heading(d,"4. Instalacion con MariaDB y DBeaver",1)
    para(d,"1) Inicie el servicio MariaDB. 2) Cree una conexion MariaDB en DBeaver hacia 127.0.0.1:3306. 3) Ejecute database/000-create-database.sql. 4) Seleccione jme y ejecute database/001-schema.sql con Alt+X. 5) Cree el usuario de aplicacion jme y otorgue SELECT, INSERT, UPDATE y DELETE sobre jme.*. 6) Configure .env con DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD.")
    para(d,"La guia operativa completa se encuentra en docs/mariadb-dbeaver.md. El script de migracion pnpm db:migrate es una alternativa cuando el usuario de Node.js tiene permisos DDL.")
    add_heading(d,"5. Configuracion y arranque",1)
    add_table_docx(d,["Variable","Uso","Ejemplo"],[("PORT","Puerto HTTP","3000"),("DB_HOST","Servidor MariaDB","127.0.0.1"),("DB_PORT","Puerto MariaDB","3306"),("DB_NAME","Base de datos","jme"),("DB_USER / DB_PASSWORD","Cuenta de aplicacion","jme / clave propia"),("SEED_ADMIN_PASSWORD","Clave inicial del administrador","minimo 12 caracteres"),("PREDICTION_INTERVAL_MINUTES","Frecuencia de alertas","60 o 0 para desactivar")])
    para(d,"Comandos principales: pnpm install, pnpm db:seed, pnpm dev. Antes de publicar: pnpm lint, pnpm test y pnpm build.")
    add_heading(d,"6. Modelo de datos",1)
    para(d,"users y sessions gestionan acceso; clients y credits representan expediente y saldo; agreements e installments representan convenios; payments actualiza saldos en una transaccion; activities registra gestiones; alerts y notification_outbox preparan alertas; audit_log conserva trazabilidad.")
    bullets(d,["Los importes se almacenan en centavos BIGINT para evitar errores de redondeo.","La referencia de pago es unica y evita duplicados.","Los pagos bloquean el credito antes de descontar saldo.","El JSON payload conserva datos de presentacion; las relaciones financieras permanecen en columnas especificas."])
    add_heading(d,"7. Servicios HTTP",1)
    add_table_docx(d,["Metodo","Ruta","Descripcion"],[("POST","/api/auth/login","Inicia sesion y devuelve token"),("GET","/api/bootstrap","Carga inicial limitada por permisos"),("GET/POST","/api/clients","Consulta y crea clientes"),("GET/POST","/api/agreements","Consulta y crea convenios"),("GET/POST","/api/payments","Consulta y registra pagos"),("GET/POST","/api/activities","Consulta y registra gestiones"),("GET","/api/reports","Indicadores de cartera"),("GET/POST","/api/alerts","Consulta y evaluacion de alertas")])
    add_heading(d,"8. Seguridad y respaldo",1)
    bullets(d,["Las contraseñas usan scrypt con salt aleatorio.","Los tokens duran ocho horas y se almacena solo su hash.","Cada ruta verifica autenticacion y permisos en servidor.","Las operaciones monetarias usan transacciones y bloqueos.","Realice respaldos diarios de MariaDB y pruebe restauraciones en una base separada.","No incluya .env, contraseñas ni tokens en el repositorio."])
    add_heading(d,"9. Diagnostico",1)
    add_table_docx(d,["Sintoma","Causa probable","Accion"],[("Connection refused","MariaDB detenido o puerto incorrecto","Inicie el servicio y pruebe 127.0.0.1:3306 en DBeaver"),("Access denied","Usuario o DB_PASSWORD incorrectos","Revise .env y GRANT del usuario jme"),("Base no existe","No se ejecuto 000-create-database.sql","Ejecute el script desde DBeaver"),("500 en login","API no puede consultar MariaDB","Revise consola del proceso Node y /api/health"),("Importe rechazado","Sobrepago o referencia repetida","Confirme saldo y use referencia unica")])
    if detailed:
        add_heading(d,"10. Mantenimiento y pruebas",1)
        para(d,"Use pnpm test para validar calendario de cuotas, seguridad, permisos y rechazos HTTP. La prueba de integracion MariaDB se habilita con RUN_DB_TESTS=1 sobre una base exclusiva. Revise los logs de Node, el espacio de disco y el estado de las sesiones expiradas. Las alertas actuales son reglas explicables de saldo y dias de mora; no representan probabilidades estadisticas.")
        add_heading(d,"11. Pantallas de referencia del prototipo",1)
        for item in SCREENSHOTS[:2]: add_figure(d,*item,width=6.2)
    else:
        add_heading(d,"10. Pantalla de referencia",1)
        add_figure(d,*SCREENSHOTS[0],width=6.2)
    add_footer(d); return d

def user_doc(detailed=True):
    title = "Manual de usuario del sistema" if detailed else "Manual de usuario resumido"
    d=setup_doc(title)
    add_heading(d,"1. Objetivo")
    para(d,"Este manual explica como ingresar y ejecutar las tareas diarias de gestion de cartera: consultar clientes, revisar saldos, registrar pagos, crear convenios, documentar gestiones y atender alertas.")
    add_heading(d,"2. Ingreso al sistema",1)
    bullets(d,["Abra la direccion proporcionada por el administrador.","Escriba correo y contraseña activos.","Pulse Acceder al Sistema.","Si recibe un error, confirme que la cuenta este activa y solicite al administrador revisar permisos."])
    add_figure(d,*SCREENSHOTS[0],width=6.2)
    add_heading(d,"3. Navegacion principal",1)
    add_table_docx(d,["Modulo","Uso diario"],[("Dashboard","Supervisar saldo vencido, clientes, recuperacion y alertas"),("Gestion de clientes","Buscar clientes, revisar mora y abrir el expediente"),("Registro de pagos","Aplicar abonos y consultar referencias"),("Convenios de pago","Crear acuerdos y revisar cuotas"),("Seguimiento de gestores","Registrar llamadas, mensajes, visitas y correos"),("Reportes","Filtrar cartera y exportar CSV o imprimir PDF"),("Usuarios y permisos","Administrar cuentas, roles y estado; solo administrador")])
    add_heading(d,"4. Consultar y crear clientes",1)
    para(d,"Abra Gestion de clientes, use el buscador o los filtros y seleccione una fila para abrir el detalle. Revise nombre, NIT, contacto, saldo, dias de mora, gestor y recomendacion. Para crear un cliente pulse Nuevo cliente, complete identificacion, segmento, saldo y mora, y guarde. El servidor calcula la evaluacion inicial y crea la cuenta de credito.")
    add_figure(d,*SCREENSHOTS[2],width=6.2)
    add_heading(d,"5. Registrar un pago",1)
    para(d,"Abra Registro de pagos, seleccione cliente, convenio si corresponde, monto y referencia bancaria. Pulse Registrar pago. El sistema valida que el importe no supere el saldo, impide referencias repetidas, actualiza el credito y aplica el pago a cuotas en orden. Revise el mensaje de confirmacion y la tabla de pagos.")
    add_heading(d,"6. Crear un convenio",1)
    para(d,"Abra Convenios de pago y pulse Nuevo convenio. Seleccione cliente, importe acordado, cantidad de cuotas, frecuencia y fecha inicial. Verifique que el importe no supere el saldo pendiente. El sistema genera el calendario y muestra proxima cuota, saldo pagado y saldo pendiente.")
    add_figure(d,*SCREENSHOTS[3],width=6.2)
    add_heading(d,"7. Registrar una gestion",1)
    para(d,"En Seguimiento de gestores pulse Nueva gestion. Seleccione cliente, canal, resultado, notas, proxima fecha y proxima accion. Sea especifico en la nota: indique lo acordado y el compromiso de seguimiento. La gestion queda asociada al usuario autenticado y se agrega al historial del cliente.")
    add_figure(d,*SCREENSHOTS[4],width=6.2)
    add_heading(d,"8. Alertas y reportes",1)
    para(d,"Las alertas priorizan casos por saldo y dias de mora. Puede ejecutar la evaluacion manual, revisar la recomendacion, resolver la alerta o colocar una accion en la bandeja pendiente. En Reportes filtre por fecha, estado y rango de mora; use Exportar CSV o Imprimir / PDF.")
    if detailed:
        add_heading(d,"9. Usuarios y permisos",1)
        para(d,"El administrador crea cuentas con correo, rol, estado y contraseña inicial. Puede modificar permisos y activar o desactivar usuarios. Una cuenta inactiva pierde sus sesiones. No desactive su propia cuenta.")
        add_heading(d,"10. Buenas practicas",1)
        bullets(d,["Confirme identidad antes de registrar una gestion.","Use referencias de pago unicas y conserve el comprobante.","Escriba notas objetivas, completas y sin datos innecesarios.","Consulte el historial antes de contactar nuevamente.","Cierre sesion al terminar y no comparta credenciales."])
        add_heading(d,"11. Mensajes frecuentes",1)
        add_table_docx(d,["Mensaje","Que hacer"],[("Credenciales invalidas","Revise correo, contraseña y estado de la cuenta"),("No tiene permiso","Solicite al administrador el permiso del modulo"),("El pago supera el saldo","Confirme monto y credito seleccionado"),("El registro ya existe","Use otra referencia o consulte el registro anterior"),("Servicio no disponible","Informe al soporte y no repita varias veces una operacion financiera")])
    add_footer(d); return d

def build_docx(doc, filename): doc.save(OUT/filename)

def pdf_styles():
    s=getSampleStyleSheet(); return {
        "title":ParagraphStyle("title",parent=s["Title"],fontName="Helvetica-Bold",fontSize=21,textColor=colors.HexColor("#17365D"),spaceAfter=10),
        "h1":ParagraphStyle("h1",parent=s["Heading1"],fontName="Helvetica-Bold",fontSize=14,textColor=colors.HexColor("#17365D"),spaceBefore=10,spaceAfter=6),
        "h2":ParagraphStyle("h2",parent=s["Heading2"],fontName="Helvetica-Bold",fontSize=11,textColor=colors.HexColor("#17365D"),spaceBefore=8,spaceAfter=4),
        "body":ParagraphStyle("body",parent=s["BodyText"],fontName="Helvetica",fontSize=9,leading=12,spaceAfter=6),
        "small":ParagraphStyle("small",parent=s["BodyText"],fontName="Helvetica",fontSize=8,leading=10,textColor=colors.HexColor("#555555")),
    }
def add_pdf_image(story,path,title,explanation):
    if path.exists():
        story += [Image(str(path), width=6.5*inch, height=6.5*inch*0.55), Paragraph(f"<b>{title}</b>",ST["small"]), Paragraph(explanation,ST["body"])]
def pdf_manual(kind,detailed):
    global ST; ST=pdf_styles(); name=("manual_tecnico" if kind=="tech" else "manual_usuario")+("_detallado" if detailed else "_resumido")+".pdf"
    doc=SimpleDocTemplate(str(OUT/name),pagesize=letter,rightMargin=.6*inch,leftMargin=.6*inch,topMargin=.55*inch,bottomMargin=.55*inch)
    story=[Paragraph(("Manual tecnico del sistema" if kind=="tech" else "Manual de usuario del sistema")+(" detallado" if detailed else " resumido"),ST["title"]),Paragraph(f"Consultoria Financiera JME Guatemala | Version 1.0 | {date.today().isoformat()}",ST["small"]),Spacer(1,10)]
    if kind=="tech":
        sections=[("Proposito", "Describe instalacion, arquitectura, MariaDB, API, seguridad, respaldo y diagnostico del monolito modular."),("Arquitectura", "React/Vite entrega interfaz; Express valida solicitudes; MariaDB conserva relaciones financieras. El codigo esta separado por modulos de autenticacion, clientes, creditos, pagos, convenios, gestiones, reportes y alertas."),("Instalacion", "En DBeaver ejecute 000-create-database.sql, seleccione jme y ejecute 001-schema.sql. Configure .env y ejecute pnpm db:seed y pnpm dev."),("Datos", "Importes en centavos, referencia de pago unica, transacciones con bloqueos y auditoria por usuario."),("Seguridad", "scrypt, tokens con ocho horas, permisos en servidor, sesiones revocables y respaldo regular."),("Diagnostico", "Connection refused indica MariaDB detenido o puerto incorrecto; Access denied indica credenciales o GRANT incorrectos; 500 requiere revisar consola de Node y /api/health.")]
    else:
        sections=[("Ingreso", "Abra la aplicacion, escriba correo y contraseña y pulse Acceder al Sistema."),("Clientes", "Busque por nombre o filtros; abra el detalle para revisar saldo, mora, contacto y gestor. Nuevo cliente crea expediente y credito."),("Pagos", "Seleccione cliente, importe y referencia. El sistema valida saldo, evita duplicados y actualiza cuotas."),("Convenios", "Seleccione cliente, monto, cuotas, frecuencia y fecha; revise el calendario generado."),("Gestiones", "Registre canal, resultado, notas y proxima accion. La actividad queda en el historial."),("Reportes y alertas", "Filtre cartera, exporte CSV o imprima PDF y atienda alertas priorizadas por saldo y dias de mora.")]
    for h,b in sections: story += [Paragraph(h,ST["h1"]),Paragraph(b,ST["body"])]
    if kind=="tech":
        story += [Paragraph("Pantallas de referencia",ST["h1"])]
        for item in SCREENSHOTS[:2 if not detailed else 5]: add_pdf_image(story,*item)
    else:
        story += [Paragraph("Pantallas y explicacion",ST["h1"])]
        for item in SCREENSHOTS[:3 if not detailed else 5]: add_pdf_image(story,*item)
    doc.build(story)

build_docx(technical_doc(True),"manual_tecnico_detallado.docx")
build_docx(technical_doc(False),"manual_tecnico_resumido.docx")
build_docx(user_doc(True),"manual_usuario_detallado.docx")
build_docx(user_doc(False),"manual_usuario_resumido.docx")
pdf_manual("tech",True); pdf_manual("tech",False); pdf_manual("user",True); pdf_manual("user",False)
print("Generados", *sorted(p.name for p in OUT.iterdir()), sep="\n- ")

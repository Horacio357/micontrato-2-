import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowLeft, Shield, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_DOCS = {
  terminos: {
    key: "tos",
    title: "Términos y Condiciones de Uso",
    subtitle: "Reglas de uso de micontratos.com y validez de la documentación jurídica",
    content: `### 1. Aceptación de los Términos
Al acceder, navegar o utilizar la plataforma micontratos.com ("la Plataforma"), usted ("el Usuario") declara que ha leído, comprendido y acepta en su totalidad los presentes Términos y Condiciones, así como nuestra Política de Privacidad. Si no está de acuerdo con alguna de las cláusulas, deberá abstenerse de utilizar el servicio.

### 2. Objeto y Naturaleza del Servicio
micontratos.com es una plataforma tecnológica SaaS diseñada para automatizar la redacción, personalización y suscripción electrónica de modelos contractuales conforme a la legislación vigente de la República Argentina (incluyendo el Código Civil y Comercial de la Nación, Ley de Locaciones y normas complementarias como el DNU 70/2023).

La Plataforma provee herramientas tecnológicas y plantillas estandarizadas. El uso de la Plataforma no constituye asesoramiento letrado personalizado ni patrocinio jurídico profesional. En caso de requerir dictamen legal sobre situaciones complejas o litigiosas, se recomienda la consulta con un abogado matriculado.

### 3. Validez Legal y Firma Electrónica
Los contratos celebrados a través de micontratos.com se formalizan mediante mecanismos de firma electrónica de acuerdo con el Artículo 288 del Código Civil y Comercial de la Nación y la Ley N° 25.506 de Firma Digital y Firma Electrónica.
La Plataforma registra e incorpora al documento generado:
- Identificación de las partes (nombre, apellido, DNI/CUIT y correo electrónico).
- Constancia de aceptación expresa de términos y declaraciones juradas.
- Trazabilidad técnica: dirección IP de origen, fecha y hora exacta (timestamp UTC) y hash criptográfico SHA-256 único e inalterable del instrumento.

### 4. Responsabilidad por los Datos Ingresados
El Usuario es el único y exclusivo responsable de la exactitud, veracidad y legalidad de toda la información suministrada en los formularios de confección del contrato. micontratos.com no verifica de oficio la titularidad de bienes ni la veracidad de los datos personales declarados por los firmantes.

### 5. Precios, Pagos y Facturación
El acceso a la descarga y suscripción de contratos definitivos está sujeto a los valores vigentes publicados en la Plataforma en Pesos Argentinos (ARS). Los pagos son procesados a través de pasarelas de pago seguras homologadas. Debido a que el servicio provee acceso inmediato a la descarga de documentación digital con valor legal, no se admiten reembolsos una vez generado y firmado el documento, salvo fallas técnicas atribuibles exclusivamente al sistema que imposibiliten la descarga.

### 6. Propiedad Intelectual
Todos los derechos de propiedad intelectual respecto del software, diseño, arquitectura, marcas, logotipos y plantillas de micontratos.com son propiedad exclusiva de sus respectivos titulares. Queda prohibida la reproducción, reventa o distribución no autorizada de la plataforma.

### 7. Ley Aplicable y Jurisdicción
Los presentes Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de la República Argentina. Ante cualquier controversia, las partes se someten a la competencia de los Tribunales Ordinarios competentes, renunciando a cualquier otro fuero que pudiera corresponderles.

Para consultas legales o administrativas, contáctenos en: admin@micontratos.com`,
  },
  privacidad: {
    key: "privacy",
    title: "Política de Privacidad y Protección de Datos",
    subtitle: "Compromiso de confidencialidad y cumplimiento de la Ley N° 25.326",
    content: `### 1. Compromiso de Confidencialidad
En micontratos.com la privacidad y protección de los datos personales de nuestros usuarios y firmantes constituyen un pilar fundamental. Tratamos toda la información con estricto apego a la Ley de Protección de los Datos Personales de la República Argentina (Ley N° 25.326), su Decreto Reglamentario N° 1558/2001 y demás normas concordantes.

### 2. Información que Recopilamos
Para la prestación adecuada del servicio y la formalización de contratos con validez legal, recopilamos:
- **Datos de identificación**: Nombres, apellidos, tipo y número de documento (DNI, CUIT/CUIL), domicilio legal y estado civil de los contratantes.
- **Datos de contacto**: Dirección de correo electrónico y teléfono de contacto.
- **Datos del contrato**: Direcciones de inmuebles, montos pactados, plazos de locación o prestación y cláusulas particulares seleccionadas.
- **Datos técnicos de auditoría de firma**: Dirección IP, user-agent del navegador web, coordenadas de geolocalización aproximada (cuando el usuario lo consiente) y trazado digitalizado de la firma manuscrita.

### 3. Finalidad del Tratamiento de Datos
Los datos personales recabados son utilizados única y exclusivamente para:
1. Confeccionar, generar y almacenar el instrumento contractual solicitado.
2. Permitir la firma electrónica de ambas partes (Locador/Locatario, Prestador/Cliente, etc.).
3. Enviar notificaciones indispensables relativas al estado del contrato y copias descargables en PDF/DOCX.
4. Generar el certificado de auditoría técnica que respalda la validez de la firma.

### 4. Prohibición de Comercialización a Terceros
micontratos.com jamás vende, cede, alquila ni comercializa las bases de datos de sus usuarios o el contenido de los contratos a terceras entidades con fines publicitarios ni de ninguna otra índole.

### 5. Medidas de Seguridad y Cifrado
Implementamos rigurosas medidas técnicas y organizativas para resguardar la integridad y confidencialidad de la información:
- Tráfico web 100% cifrado mediante protocolo HTTPS / TLS.
- Almacenamiento seguro en servidores con bases de datos relacionales protegidas y respaldos periódicos.
- Tokens criptográficos únicos e intransferibles para los enlaces de firma de cada parte contratante.

### 6. Ejercicio de Derechos ARCO (Acceso, Rectificación y Cancelación)
De conformidad con el Artículo 14 de la Ley 25.326, el titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses. Asimismo, podrá solicitar la rectificación, actualización o supresión de sus datos enviando un correo a **admin@micontratos.com**.

La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.`,
  },
};

export default function LegalPage({ type = "terminos" }) {
  const defaultDoc = DEFAULT_DOCS[type] || DEFAULT_DOCS.terminos;
  const targetKey = defaultDoc.key;

  const { data: legalDocs = [] } = useQuery({
    queryKey: ["public-legal-docs"],
    queryFn: () => base44.entities.LegalDocument.list(),
  });

  const dbDoc = legalDocs.find(
    (d) => (d.document_type || d.key) === targetKey
  );

  const displayTitle = dbDoc?.title || defaultDoc.title;
  const displayContent = dbDoc?.content?.trim() ? dbDoc.content : defaultDoc.content;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <div className="border border-border/80 bg-card rounded-xl p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              {type === "terminos" ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                micontratos.com • Legal
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {displayTitle}
              </h1>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
            {defaultDoc.subtitle} — Última actualización: {new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long" })}
          </p>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line font-sans">
            {displayContent}
          </div>

          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" />
              <span>Conforme a la legislación de la República Argentina</span>
            </div>
            <div>
              Dudas o consultas:{" "}
              <a href="mailto:admin@micontratos.com" className="text-accent underline hover:opacity-80">
                admin@micontratos.com
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

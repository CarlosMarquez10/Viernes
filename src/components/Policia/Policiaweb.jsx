// Declaración de la variable miVariable
const miVariable = 'https://sig.policia.gov.co/MNVCC/';

// Definición del componente FormMain y sus funciones fuera de PruebMedidor
const FormMain = () => {
  return (
    <iframe className='myiframe' src={miVariable} width="100%" height="600px">
      Tu navegador no soporta iframes.
    </iframe>
  );
};

// Definición del componente PruebMedidor
function Policiaweb() {
  return (
    <main>
      <FormMain />
    </main>
  );
}

export default Policiaweb;
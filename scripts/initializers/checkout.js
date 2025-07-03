import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';

console.log('🔄 [checkout.js] - Archivo cargado');

await initializeDropin(async () => {
  console.log('⚙️ [checkout.js] - Ejecutando initializeDropin');

  // Set headers
  const headers = getHeaders('checkout');
  console.log('📦 [checkout.js] - Headers obtenidos:', headers);
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...headers }));

  // Fetch labels
  const labels = await fetchPlaceholders('placeholders/checkout.json');
  console.log('📝 [checkout.js] - Placeholders cargados:', labels);

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  console.log('🧩 [checkout.js] - langDefinitions definidos');

  // Montaje del componente + extensión de modelo
  const models = {
    CartModel: {
      transformer: (data) => {
        console.log('🔄 [checkout.js] - CartModel.transformer ejecutado con:', data);
        return {
          availablePaymentMethods: data?.available_payment_methods,
          selectedPaymentMethod: data?.selected_payment_method,
        };
      },
    },
  };

  console.log('🚀 [checkout.js] - Inicializando drop-in con models y langDefinitions');

  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models,
  });
});

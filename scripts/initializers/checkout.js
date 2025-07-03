import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';

console.log('🔄 [checkout.js] - Archivo cargado ---');

await initializeDropin(async () => {
  console.log('⚙️ [checkout.js] - Ejecutando initializeDropin');

  const headers = getHeaders('checkout');
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...headers }));
  console.log('📦 [checkout.js] - Headers:', headers);

  const labels = await fetchPlaceholders('placeholders/checkout.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };
  console.log('📝 [checkout.js] - Placeholders:', labels);

  // Extensión segura del CartModel
  const models = {
    CartModel: {
      transformer: (data) => {
        console.log('🔄 [checkout.js] - CartModel.transformer ejecutado con:', data);
        return {
          ...data,
          availablePaymentMethods: data?.available_payment_methods,
          selectedPaymentMethod: data?.selected_payment_method,
        };
      },
    },
  };

  console.log('🚀 [checkout.js] - Montando drop-in');
  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models,
  });
})();

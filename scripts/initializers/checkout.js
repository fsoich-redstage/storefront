import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';

console.log('🧩 [checkout.js] - INIT');

await initializeDropin(async () => {
  console.log('🧩 [checkout.js] - Running initializeDropin');

  // Paso 2: Setear headers
  setFetchGraphQlHeaders((prev) => {
    const newHeaders = { ...prev, ...getHeaders('checkout') };
    console.log('🧩 [checkout.js] - GraphQL Headers:', newHeaders);
    return newHeaders;
  });

  // Paso 3: Fetch traducciones
  const labels = await fetchPlaceholders('placeholders/checkout.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };
  console.log('🧩 [checkout.js] - langDefinitions:', langDefinitions);

  // Paso 4: Extender el modelo CartModel
  const models = {
    CartModel: {
      transformer: (data) => {
        const result = {
          availablePaymentMethods: data?.available_payment_methods,
          selectedPaymentMethod: data?.selected_payment_method,
        };
        console.log('🧩 [checkout.js] - CartModel.transformer:', result);
        return result;
      },
    },
  };

  console.log('🧩 [checkout.js] - Calling mountImmediately...');
  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models,
  });
});

// EVENTOS (Paso 4 extra)
events.on('checkout/initialized', (data) => {
  console.log('🧩 [checkout.js] - checkout/initialized:', data);
}, { eager: true });

events.on('cart/data', (data) => {
  console.log('🧩 [checkout.js] - cart/data:', data);
}, { eager: true });

events.on('order/placed', (data) => {
  console.log('🧩 [checkout.js] - order/placed:', data);
});

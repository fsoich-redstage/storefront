import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';

// ✅ LOG DEBUG para confirmar que el archivo está activo
console.log('[💣 INIT] Drop-in initialized — Fulcrum patch active');

await initializeDropin(async () => {
  // Paso 2: Seteamos headers
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));

  const labels = await fetchPlaceholders('placeholders/checkout.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  // Paso 3: Extendemos CartModel para OOPE
  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
          };
        },
      },
    },
  });
})();

// Paso 4: Eventos para debug en consola
events.on('checkout/initialized', (data) => {
  console.log('[🧠 checkout/initialized]', data);
}, { eager: true });

events.on('cart/data', (cartData) => {
  console.log('[📦 cart/data]', cartData);
}, { eager: true });

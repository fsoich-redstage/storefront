import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';

const ggg = (...args) => console.log('🔧 [checkout.js]', ...args);

await initializeDropin(async () => {
  ggg('initializeDropin iniciado ✅');

  // Paso 2: Headers para GraphQL
  setFetchGraphQlHeaders((prev) => {
    const headers = { ...prev, ...getHeaders('checkout') };
    ggg('Headers GraphQL seteados:', headers);
    return headers;
  });

  // Paso 3: Cargar placeholders
  const labels = await fetchPlaceholders('placeholders/checkout.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };
  ggg('Placeholders cargados:', langDefinitions);

  // Paso 4: Mount con modelo OOPE
  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          const res = {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
          };
          ggg('CartModel.transformer ejecutado:', res);
          return res;
        },
      },
    },
  });
});

// Eventos extra
events.on('checkout/initialized', (data) => {
  ggg('Evento checkout/initialized 🔔', data);
}, { eager: true });

events.on('cart/data', (data) => {
  ggg('Evento cart/data 📦', data);
}, { eager: true });

events.on('order/placed', (data) => {
  ggg('Evento order/placed 💳', data);
});

import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';

await initializeDropin(async () => {
  console.log('[checkout.js] 🚀 Iniciando Drop-in XXX');

  // Paso 2: Setear headers para GraphQL
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));
  console.log('[checkout.js] 🧾 Headers GraphQL configurados XXX');

  // Paso 3: Obtener labels
  const labels = await fetchPlaceholders('placeholders/checkout.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };
  console.log('[checkout.js] 🌍 Labels cargados XXX');

  // Paso 4: Declarar modelo CartModel
  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('[checkout.js] 🧠 Transformando CartModel:', data, 'XXX');
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
            shippingAddresses: data?.shipping_addresses,
            selectedShippingMethod: data?.shipping_addresses?.[0]?.selected_shipping_method,
          };
        },
      },
    },
  });
});

// Paso 5: Escuchar eventos y loguear
events.on('checkout/initialized', (data) => {
  console.log('[checkout.js] ✅ Evento: checkout/initialized', data, 'XXX');
}, { eager: true });

events.on('cart/data', (data) => {
  console.log('[checkout.js] 🛒 Evento: cart/data', data, 'XXX');

  console.log('[checkout.js] 💳 Métodos de pago:', data?.available_payment_methods, 'XXX');
  console.log('[checkout.js] 🚚 Métodos de envío:', data?.shipping_addresses?.[0]?.available_shipping_methods, 'XXX');
}, { eager: true });

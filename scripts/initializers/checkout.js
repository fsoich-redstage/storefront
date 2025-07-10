import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';

// Eventos OOPE simples (sin handler.js que rompe en EDS)
import events from '@dropins/tools/lib/events.js';

console.log('CHECKOUT INIT: Iniciando Drop-in Checkout');

await initializeDropin(async () => {
  console.log('CHECKOUT INIT: Seteando headers de GraphQL');
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));

  console.log('CHECKOUT INIT: Cargando placeholders...');
  const labels = await fetchPlaceholders('placeholders/checkout.json');

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  console.log('CHECKOUT INIT: Ejecutando mountImmediately con CartModel');

  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('CHECKOUT DEBUG: CartModel raw data:', JSON.stringify(data, null, 2));
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
            availableShippingMethods: data?.available_shipping_methods,
            selectedShippingMethod: data?.selected_shipping_method,
          };
        },
      },
    },
  });
});

// ✅ Eventos OOPE activados con logs
console.log('CHECKOUT INIT: Registrando eventos OOPE');

events.on('checkout/initialized', (eventData) => {
  console.log('OOPE EVENT: checkout/initialized →', eventData);
}, { eager: true });

events.on('cart/data', (eventData) => {
  console.log('OOPE EVENT: cart/data →', eventData);
}, { eager: true });

console.log('CHECKOUT INIT: Listo y esperando eventos');

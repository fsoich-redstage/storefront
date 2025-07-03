import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';

function handleCheckoutInitialized(data) {
  console.log('[checkout.js] 🛒 Evento: cart/initialized FEDE');
  console.log('[checkout.js] 💳 Métodos de pago:', data?.availablePaymentMethods, 'FEDE');
  console.log('[checkout.js] 🚚 Métodos de envío:', data?.shipping_addresses?.[0]?.available_shipping_methods, 'FEDE');
}

function handleCartData(data) {
  console.log('[checkout.js] 🛒 Evento: cart/data FEDE');
  console.log('[checkout.js] 🛍️ CartModel.transformer recibió:', data, 'FEDE');
}

events.on('checkout/initialized', handleCheckoutInitialized, { eager: true });
events.on('cart/data', handleCartData, { eager: true });

await initializeDropin(async () => {
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));

  const labels = await fetchPlaceholders('placeholders/checkout.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('[checkout.js] 🛒 CartModel.transformer recibió:', data, 'FEDE');
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
            shippingAddresses: data?.shipping_addresses,
          };
        },
      },
    },
  });
})();

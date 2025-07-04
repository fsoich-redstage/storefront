import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';

function handleCheckoutInitialized(data) {
  console.log('[checkout.js] 🛒 Evento: cart/initialized BBB');
  console.log('[checkout.js] 💳 Métodos de pago:', data?.availablePaymentMethods, 'BBB');
  console.log('[checkout.js] 🚚 Métodos de envío:', data?.shipping_addresses?.[0]?.available_shipping_methods, 'BBB');
}

function handleCartData(data) {
  console.log('[checkout.js] 🛒 Evento: cart/data BBB');
  console.log('[checkout.js] 🛍️ CartModel.transformer recibió:', data, 'BBB');
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
          const shipping = data?.shipping_addresses?.[0] || {};
          console.log('[checkout.js] 🛒 CartModel.transformer recibió:', data, 'BBB');
          return {
            availablePaymentMethods: data?.available_payment_methods ?? [],
            selectedPaymentMethod: data?.selected_payment_method ?? null,
            availableShippingMethods: shipping?.available_shipping_methods ?? [],
            selectedShippingMethod: shipping?.selected_shipping_method ?? null,
            shippingAddresses: data?.shipping_addresses ?? [],
          };
        },
      },
    },
  });
})();

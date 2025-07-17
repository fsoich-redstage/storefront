import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';

await initializeDropin(async () => {
  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));

  const labels = await fetchPlaceholders('placeholders/checkout.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  // Step 2: Extend CartModel to expose shipping and payment methods
  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
  CartModel: {
    transformer: (data) => ({
      availablePaymentMethods: data?.available_payment_methods,
      selectedPaymentMethod: data?.selected_payment_method,
      availableShippingMethods: (data?.available_shipping_methods || []).filter(
        (method) => method?.method_title !== 'FD'
      ),
      selectedShippingMethod: data?.selected_shipping_method,
    }),
  },
},

  });
})();

// Step 3: Listen for checkout initialized event
events.on('checkout/initialized', (data) => {});

// Step 4: Listen for cart data event
events.on('cart/data', (data) => {});

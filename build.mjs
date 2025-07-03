import { overrideGQLOperations } from '@dropins/build-tools/gql-extend.js';

overrideGQLOperations([
  {
    npm: '@dropins/storefront-cart',
    skipFragments: ['DOWNLOADABLE_CART_ITEMS_FRAGMENT'],
    operations: [],
  },
  {
    npm: '@dropins/storefront-order',
    skipFragments: ['DOWNLOADABLE_ORDER_ITEMS_FRAGMENT'],
    operations: [],
  },
  {
    npm: '@dropins/storefront-checkout',
    operations: [
      {
        operationName: 'getCart',
        operationType: 'query',
        gql: `
          query getCart($cartId: String!) {
            cart(cart_id: $cartId) {
              id
              email
              is_virtual
              total_quantity
              available_payment_methods {
                code
                title
                oope_payment_method_config {
                  backend_integration_url
                  custom_config {
                    ... on CustomConfigKeyValue {
                      key
                      value
                    }
                  }
                }
              }
              selected_payment_method {
                code
                title
                oope_payment_method_config {
                  backend_integration_url
                  custom_config {
                    ... on CustomConfigKeyValue {
                      key
                      value
                    }
                  }
                }
              }
              shipping_addresses {
                selected_shipping_method {
                  carrier_code
                  method_code
                  carrier_title
                  method_title
                  amount {
                    value
                    currency
                  }
                }
                available_shipping_methods {
                  carrier_code
                  method_code
                  carrier_title
                  method_title
                  amount {
                    value
                    currency
                  }
                }
              }
            }
          }
        `
      }
    ],
  },
]);

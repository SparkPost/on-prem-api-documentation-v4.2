# Group Relay Webhooks

**Note:** The Relay Webhooks API is available as beta in Momentum 4.2 only.

By configuring a relay webhook for a specified inbound domain, those inbound messages can be forwarded to a specified target over HTTP.  Before you create a relay webhook, be sure to first create an inbound domain that is properly configured. The Relay Webhooks API provides the means to create, list, retrieve, update, and delete a relay webhook.

## Relay Webhooks Object Properties

| Property  | Type   | Description                          | Required | Notes 
|-----------|--------|--------------------------------------|----------|----------------------|
| name      | string | User-friendly name                   | no       | example: `Inbound Customer Replies` |
| target    | string | URL of the target to which to POST relay batches | yes | example: `https://webhooks.customer.example/replies` |
| auth_token | string | Authentication token to present in the X-MessageSystems-Webhook-Token header of POST requests to target | no | Use this token in your target application to confirm that data is coming from the Relay Webhooks API. example: `5ebe2294ecd0e0f08eab7690d2a6ee69` |
| match     | object | Restrict which inbound messages will be relayed to the target | yes | See Match Object Properties. example: `"match": { "protocol": "SMTP", "domain": "replies.customer.example" }` |

### Match Object Properties

| Property  | Type   | Description                                                 | Required               | Notes 
|-----------|--------|-----------------------------------------------------------------------|--------------|----------------------|
| protocol  | string | Inbound messaging protocol associated with this webhook | no - defaults to "SMTP" |                      |
| domain    | string | Inbound domain associated with this webhook             | yes |     |

## Field Defintions

The following fields will be included in the JSON object posted to the relay webhooks target:

| Field     | Type   | Description                                                 | Notes
|-----------|--------|-----------------------------------------------------------------------|--------------|----------------------|
| content   | object | Content that will be used to construct a relay message           | For a full description, see the Content Attributes. |
| friendly_from | string | Email address used to compose the "From" header |
| msg_from | string | SMTP envelope from |
| rcpt_to | string | SMTP envelope to |
| webhook_id | string | ID of the relay webhook which triggered this relay message |

### Content Attributes

Content for a relay webhook is described in a JSON object with the following fields:

| Field     | Type   | Description                                                 | Notes
|-----------|--------|-------------------------------------------------------------|----------------|
| cc        | array of strings | "CC" header value (decoded from email), RFC2822 address list |
| email_rfc822 | string | Raw MIME content for an email | This will approximately double the size of the JSON data sent via the webhook. |
| headers   | array of objects | Ordered array of email top-level headers | This array preserves ordering and allows for multiple occurrences of a header (e.g.: to support trace headers such as "Received"). |
| html      | string | Contents of the first text/html part of the message |
| subject   | string | "Subject" header value (decoded from email) |
| text      | string | Contents of the first text/plain part of the message |
| to        | array of strings | "To" header value (decoded from email), RFC2822 address list |

## Create and List [/relay-webhooks]

### Create a Relay Webhook [POST]

Create a relay webhook by providing a **relay webhooks object** as the POST request body.

+ Request (application/json)

  + Headers

      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

  + Body

            {
              "name": "Replies Webhook",
              "target": "https://webhooks.customer.example/replies",
              "auth_token": "",
              "match":
                {
                  "protocol": "SMTP",
                  "domain": "email.example.com"
                }
            }

+ Response 200 (application/json)

  + Body

            {
              "results":
                {
                  "id": "12013026328707075"
                }
            }

+ Response 400 (application/json)

  + Body

          { "errors": [
              {
                "message": "invalid params",
                "description": "Domain '(domain)' is not a registered inbound domain",
                "code": "1200"
              }
            ]
          }

+ Response 401 (application/json)

  + Body

          { "errors": [
              {
                "message": "Unauthorized Tenant",
                "code": "1303"
              }
            ]
          }

+ Response 409 (application/json)

  + Body

          { "errors": [
              {
                "message": "resource conflict",
                "description": "Domain '(domain)' is already in use",
                "code": "1602"
              }
            ]
          }

+ Response 422 (application/json)

  + Body

            {
              "errors" : [
                {
                  "message" : "required field is missing",
                  "description" : "field '(field_name)' is required",
                  "code" : "1400"
                }
              ]
            }

+ Response 422 (application/json)

  + Body

            {
              "errors" : [
                {
                  "message": "invalid data format/type",
                  "description": "Error validating domain name syntax for domain: '(domain)'",
                  "code": "1300"
                }
              ]
            }

### List all Relay Webhooks [GET]

List all your relay webhooks.

+ Request

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
      Accept: application/json

+ Response 200 (application/json)

  + Body
         { "results": [
              {
                "id": "12013026328707075",
                "name": "Replies Webhook",
                "target": "https://webhooks.customer.example/replies",
                "auth_token": "",
                "match":
                  {
                    "protocol": "SMTP",
                    "domain": "email.example.com"
                  }
              }
            ]
          }

+ Response 401 (application/json)

  + Body
          {
            "errors": [
              {
                "message": "Unauthorized Tenant",
                "code": "1303"
              }
            ]
          }

## Retrieve, Update, and Delete [/relay-webhooks/{webhook_id}]

### Retrieve a Relay Webhook [GET]

Retrieve a specific relay webhook by specifying the webhook ID in the URI path.

+ Parameters
  + webhook_id (required, string, `12013026328707075`) ... Webhook ID

+ Request

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
      Accept: application/json

+ Response 200 (application/json)

  + Body
         {
            "results": {
              "name": "Replies Webhook",
              "target": "https://webhooks.customer.example/replies",
              "auth_token": "",
              "match": {
                  "protocol": "SMTP",
                  "domain": "email.example.com"
              }
            }
         }

+ Response 401 (application/json)

  + Body
          {
            "errors": [
              {
                "message": "Unauthorized Tenant",
                "code": "1303"
              }
            ]
          }

+ Response 404 (application/json)

  + Body
          {
            "errors": [
              {
                "message": "resource not found",
                "code": "1600"
              }
            ]
          }

### Update a Relay Webhook [PUT]

Update a relay webhook by specifying the webhook ID in the URI path.

+ Parameters
  + webhook_id (required, string, `12013026328707075`) ... Webhook ID

+ Request (application/json)

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

  + Body

            {
              "name": "New Replies Webhook",
              "target": "https://webhook.customer.example/replies"
            }

+ Response 200 (application/json)

  + Body

            {
              "results":
                {
                  "id": "12013026328707075"
                }
            }

+ Response 400 (application/json)

  + Body
          {
            "errors": [
              {
                "message": "invalid params",
                "description": "Domain ('domain') is not a registered inbound domain",
                "code": "1200"
              }
            ]
          }

+ Response 401 (application/json)

  + Body
          {
            "errors": [
              {
                "message": "Unauthorized Tenant",
                "code": "1303"
              }
            ]
          }

+ Response 404 (application/json)

  + Body
          {
            "errors": [
              {
                "message": "resource not found",
                "description": "UPDATE requires a webhook_id in the URI",
                "code": "1600"
              }
            ]
          }

+ Response 404 (application/json)

  + Body
          {
            "errors": [
              {
                "message": "resource not found",
                "code": "1600"
              }
            ]
          }

+ Response 409 (application/json)

  + Body

          { "errors": [
              {
                "message": "resource conflict",
                "description": "Domain '(domain)' is already in use",
                "code": "1602"
              }
            ]
          }

+ Response 422 (application/json)

  + Body

            {
              "errors" : [
                {
                  "message": "invalid data format/type",
                  "description": "Error validating domain name syntax for domain: '(domain)'",
                  "code": "1300"
                }
              ]
            }

### Delete a Relay Webhook [DELETE]

Delete a relay webhook by specifying the webhook ID in the URI path.

+ Parameters
  + webhook_id (required, string, `12013026328707075`) ... Webhook ID

+ Request

  + Headers
      Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

+ Response 200

+ Response 401 (application/json)

  + Body
          {
            "errors": [
              {
                "message": "Unauthorized Tenant",
                "code": "1303"
              }
            ]
          }

+ Response 404 (application/json)

  + Body
          {
            "errors": [
              {
                "message": "resource not found",
                "description": "DELETE requires a webhook_id in the URI",
                "code": "1600"
              }
            ]
          }

+ Response 404 (application/json)

  + Body
          {
            "errors": [
              {
                "message": "resource not found",
                "code": "1600"
              }
            ]
          }

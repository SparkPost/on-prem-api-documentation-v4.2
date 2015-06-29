# Group Templates

A template is a named collection of content stored on the server side.  Templates are used
in a transmission by providing the id of the template at the time of transmission submission.  Each textual component of the
template (headers, text, and html) is run through the substitution engine
to produce recipient specific email messages.  The Templates API provides the means to manage your templates.

## Template Attributes

| Field         | Type     | Description                           | Required   | Notes   |
|------------------------|:-:       |---------------------------------------|-------------|--------|
|id    |string  |Short, unique, alphanumeric ID used to reference the template   | At a minimum, id or name is required upon creation.  It is auto generated if not provided. |After a template has been created, this property cannot be changed.  Maximum length - 64 bytes   |
|content              |JSON  |Content that will be used to construct a message  |  yes  |  For a full description, see the Content Attributes. Maximum length - 15 MBs  |
|published |boolean |Whether the template is published or is a draft version|no - defaults to false|A template cannot be changed from published to draft.|
|name |string  |Editable display name  | At a minimum, id or name is required upon creation.   |The name does not have to be unique.  Maximum length - 1024 bytes   |
|description |string  |Detailed description of the template  |no    | Maximum length - 1024 bytes |
|options |JSON |JSON object in which template options are defined|no| For a full description, see the Options Attributes.|


### Content Attributes

Content for a template is described in a JSON object with the following fields:

| Field         | Type     | Description                           | Required   | Notes   |
|------------------------|:-:       |---------------------------------------|-------------|--------|
|html    |string  |HTML content for the email's text/html MIME part|At a minimum, html or text is required.  |Expected in the UTF-8 charset with no Content-Transfer-Encoding applied.  Substitution syntax is supported. |
|text    |string  |Text content for the email's text/plain MIME part|At a minimum, html or text is required. |Expected in the UTF-8 charset with no Content-Transfer-Encoding applied.  Substitution syntax is supported.|
|subject |string  |Email subject line   | yes |Expected in the UTF-8 charset without RFC2047 encoding.  Substitution syntax is supported. |
|from |string or JSON  | Address _"from" : "deals@company.com"_ or JSON object composed of the "name" and "email" fields _"from" : { "name" : "My Company", "email" : "deals@company.com" }_ used to compose the email's "From" header| yes | Substitution syntax is supported. |
|reply_to |string  |Email address used to compose the email's "Reply-To" header | no | Substitution syntax is supported. |
|headers| JSON | JSON dictionary containing headers other than "Subject", "From", "To", and "Reply-To"  | no |See the Header Notes. |

#### Header Notes

* Headers such as "Content-Type" and "Content-Transfer-Encoding" are not allowed here as these are auto generated upon construction of the email.
* The "To" header should not be specified here, since it is generated from each recipient's _address.name_ and _address.email_.
* Each header value is expected in the UTF-8 charset without RFC2047 encoding.
* Substitution syntax is supported.

Alternately, the content JSON object may contain a single "email_rfc822" field.  email_rfc822 is mutually exclusive with all of the above fields.

| Field         | Type     | Description                           | Required   | Notes   |
|--------------------|:-:       |---------------------------------------|-----------------------|--------|
|email_rfc822    |string  |Pre-built message with the format as described by the [message/rfc822 Content-Type](http://tools.ietf.org/html/rfc2046#section-5.2.1) |no   |  See the email_rfc822 Notes. |

#### email_rfc822 Notes

* Substitutions will be applied in the top-level headers and the first non-attachment text/plain and
first non-attachment text/html MIME parts only.
* Lone `LF`s and lone `CR`s are allowed. The system will convert line endings to `CRLF` where
necessary.
* The provided email_rfc822 should NOT be dot stuff.  The system dot stuffs before sending the outgoing message.
* The provided email_rfc822 should NOT contain the SMTP terminator `\r\n.\r\n`.  The system always adds this terminator.
* The provided email_rfc822 in MIME format will be rejected if SparkPost cannot parse the contents into a MIME tree.

### Options Attributes

Options for a template are described in a JSON object with the following fields:

| Field         | Type     | Description                           | Required   | Notes   |
|--------------------|:-:       |---------------------------------------|-------------|------------------|
|open_tracking |boolean |Enable or disable open tracking | no - defaults to the setting at the transmission level | To override the default for a specific transmission, specify the _options.open_tracking_ field upon creation of the transmission. |
|click_tracking |boolean |Enable or disable click tracking | no - defaults to the setting at the transmission level | To override the default for a specific transmission, specify the _options.click_tracking_ field upon creation of the transmission. |
|transactional |boolean |Distinguish between transactional and non-transactional messages for unsubscribe and suppression purposes | no - defaults to the setting at the transmission level | To override the default for a specific transmission, specify the _options.transactional_ field upon creation of the transmission. |

## Error Attributes

On success, the API returns a "results" JSON object along with HTTP 200.  However, on failure, an "errors" JSON array will be returned along with HTTP 4xx.  Each error is described in a JSON object with the following fields:

| Field         | Type     | Description                           |  Example |
|--------------------|:-:       |---------------------------------------|--------|
|message |string | Explains the class of error  | "substitution language syntax error in template content" |
|code |string| Identifies the class of error| "3000" |
|description|string| Detailed explanation of error| "Error while compiling part text: line 4: syntax error near 'age'" |
|part|string| For substitution errors, identifies the MIME part where the error occurred | "text", "html", "Header:Subject", "text/plain" |
|line|number| For substitution errors, identifies the line number within the MIME part identified by the "part" JSON field | 4 |

## Create and List [/templates]

### Create a Template [POST]

Create a template by providing a **template object** as the POST request body.

At a minimum, the "name" and "content" fields are required, where content must contain the "from", "subject", and at least one of "html" or "text" fields.

By default, when a template is referenced in a transmission, it is the published version of that template.  To submit a transmission that uses a draft template, set the transmission field "use_draft_template" to true.  For additional details, see the Transmissions API documentation for Using a Stored Template.


#### Create Parts

The following are key points about creating parts in your templates, as shown in the example:

* The "id" field may be supplied, and it must be unique.
* By default, templates are created as drafts.  If you would like to directly publish a template upon creation, set the "published" field to true.
* Open and click tracking may be enable/disabled at the template level using the "open_tracking" and
"click_tracking" fields.
* The "from" field may be a JSON object composed of "email" and "name".
* A "Reply-To" header may be specified using the "reply_to" field.
* Both "text" and "html" may be provided.
* Additional headers may be specified in the "headers" JSON dictionary.


#### Create RFC822

Fully formed email_rfc822 content may be provided instead of the "text", "html", "from", and "subject" parts, as shown in the example.



+ Request Create Basic Template (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

    + Body

        ```
        {
            "name" : "Summer Sale!",

            "content": {
                "from": "marketing@bounces.company.example",
                "subject": "Summer deals",
                "html": "<b>Check out these deals!</b>"
            }
        }
        ```

+ Response 200 (application/json)

        {
          "results": {
            "id": "11806290401558530"
          }
        }

+ Response 403 (application/json)

        {
          "errors" : [
            {
              "description" : "Unconfigured or unverified sending domain.",
              "code" : "1100",
              "message" : "permission denied"
            }
          ]
        }

+ Response 422 (application/json)

        {
          "errors" : [
            {
              "part" : "text",
              "description" : "Error while compiling part text: line 4: syntax error near 'age'",
              "line" : 4,
              "code" : "3000",
              "message" : "substitution language syntax error in template content"
            }
          ]
        }

+ Request Create Parts (application/json)

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

  + Body

        ```js
        {
          "id" : "summer_sale",
          "name" : "Summer Sale!",
          "published" : true,

          "options": {
            "open_tracking" : false,
            "click_tracking" : true
          },

          "content": {
            "from": {
              "email": "marketing@bounces.company.example",
              "name": "Example Company Marketing"
            },

            "subject": "Summer deals for {{name}}",
            "reply_to": "Summer deals <summer_deals@company.example>",

            "text": "Check out these deals {{name}}!",
            "html": "<b>Check out these deals {{name}}!</b>",

            "headers": {
              "X-Customer-Campaign-ID": "Summer2014"
            }
          }
        } 
        ```

+ Response 200 (application/json)

        {
          "results": {
            "id": "summer_sale"
          }
        }


+ Request Create RFC822 (application/json)

  + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

  + Body

        ```js
        {
          "id" : "another_summer_sale",
          "name" : "Summer Sale!",
          "published" : true,

          "options": {
            "open_tracking" : false,
            "click_tracking" : true
          },

          "content": {
            "email_rfc822" : "Content-Type: text/plain\nFrom: Example Company Marketing <marketing@bounces.company.example>\nReply-To:Summer deals <summer_deals@company.example>\nX-Customer-Campaign-ID: Summer2014\nSubject: Summer deals for {{name}}\n\nCheck out these deals {{name}}!"
          }
        }
        ```

+ Response 200 (application/json)

        {
          "results": {
            "id": "another_summer_sale"
          }
        }

### List all Templates [GET]

Lists the most recent version of each template in your account. Each template object in the list will have the following fields:

- id: Unique template ID
- name: Template name
- published: Published state of the template (true = published, false = draft)
- description: Template description

+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 (application/json)

        {
          "results" : [
            {
              "id" : "summer_sale",
              "name" : "Summer Sale!",
              "published" : true,
              "description" : ""
            },
            {
              "id" : "daily",
              "name" : "daily",
              "published" : false,
              "description" : ""
            }
          ]
        }

## Retrieve [/templates/{id}{?draft}]

### Retrieve a Template [GET]

Retrieve a single template by specifying its ID in the URI path. By default, the most recently
updated version is returned. Use the **draft** query parameter to specify a draft or published
template.


The result will include a "last_update_time" field. The "last_update_time" is the time the template was last updated, for both draft and published versions.

If the template was used for message generation, the result will also include a "last_use" field. The "last_use" time represents the last time any version of this template was used (draft or published).


+ Parameters
    + id (required, string, `11714265276872`) ... ID of the template
    + draft (optional, boolean, `true`) ...If true, returns the most recent draft template.  If false, returns the most recent published template.  If not provided, returns the most recent template version regardless of draft or published.

+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf
            Accept: application/json

+ Response 200 (application/json)

        {
          "results" : {
            "id" : "summer_sale",
            "name" : "Summer Sale!",
            "description" : "",
            "published" : true,
            "last_update_time": "2014-05-22T15:12:59+00:00",
            "last_use": "2014-06-02T08:15:30+00:00",

            "options": {
              "open_tracking" : false,
              "click_tracking" : true
            },

            "content": {
              "from": {
                "email": "marketing@bounces.company.example",
                "name": "Example Company Marketing"
              },

              "subject": "Summer deals for {{name}}",
              "reply_to": "Summer deals <summer_deals@company.example>",

              "text": "Check out these deals {{name}}!",
              "html": "<b>Check out these deals {{name}}!</b>",

              "headers": {
                "X-Customer-Campaign-ID": "Summer2014"
              }
            }
          }
        }

## Update [/templates/{id}{?update_published}]

### Update a Template [PUT]

Update an existing template by specifying its ID in the URI path and use a **template object** as the PUT request body.
By default, the update will result in a new draft version, but the published version can be overwritten directly by using the **update_published** query parameter.

**Note**

The "name" field may be modified, but the "id" field is read only.

If a content object is provided in the update request, it must
contain all relevant content fields whether they are being changed or not.
The new content will completely overwrite the existing content.

The example shows an update that will rename the template, enable open tracking,
and update the content all in one API call. All content fields are included whether they are being
changed or not.

**Note:** Publishing a template is a specific case of an update.  The body of the PUT
request should contain the `"published": true` field as shown in the example. The 
**update_published** query parameter does not apply.

+ Parameters
    + id (required, string, `11714265276872`) ... ID of the template
    + update_published = `false` (optional, boolean, `true`) ...If true, directly overwrite the existing published template.  If false, create a new draft.

+ Request Update (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

    + Body

        ```
        {
          "options" : {
            "open_tracking": true
          },
          "name" : "A new name!",
          "content": {
            "from": {
              "email": "marketing@bounces.company.example",
              "name": "Example Company Marketing"
            },
            "subject": "Updated Summer deals for {{name}}",
            "reply_to": "Summer deals <summer_deals@company.example>",
            "text": "Updated: Check out these deals {{name}}!",
            "html": "<b>Updated: Check out these deals {{name}}!</b>"
          }
        }
        ```

+ Response 200


+ Request Publish (application/json)

  + Headers
      
            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

  + Body

        ```js
        {
          "published": true
        }
        ```

+ Response 200


## Preview [/templates/{id}/preview{?draft}]

### Preview a Template [POST]

Preview the most recent version of an existing template by specifying {id}/preview in the URI path
and providing "substitution_data" as part of the POST request body.
The template's content will be expanded using the substitution data provided and returned
in the response. By default, the most recently updated version is returned.  Use the **draft** query parameter to specify a draft or published
template.

See the Substitutions Reference section for more information.

+ Parameters
    + id (required, string, `11714265276872`) ... ID of the template
    + draft (optional, boolean, `true`) ...If true, previews the most recent draft template.  If false, previews the most recent published template.  If not provided, previews the most recent template version regardless of draft or published.

+ Request (application/json)

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

    + Body

        ```
        {
          "substitution_data" : {
            "name" : "Natalie",
            "age" : 35,
            "member" : true
          }
        }
        ```

+ Response 200 (application/json)

        {
            "results" : {
                "from": {
                    "email": "marketing@bounces.company.example",
                    "name": "Example Company Marketing"
                },
                "subject": "Summer deals for Natalie",
                "reply_to": "Summer deals <summer_deals@company.example>",
                "text": "Check out these deals Natalie!",
                "html": "<b>Check out these deals Natalie!</b>",
                "headers": {
                    "X-Customer-Campaign-ID": "Summer2014"
                }
            }
        }

## Delete [/templates/{id}]

### Delete a Template [DELETE]

Delete a template by specifying its ID in the URI path.
If the template delete API call succeeds, then ALL versions of the template will be deleted from the system (both published AND draft versions).


+ Parameters
    + id (required, string, `11714265276872`) ... ID of the template

+ Request

    + Headers

            Authorization: 14ac5499cfdd2bb2859e4476d2e5b1d2bad079bf

+ Response 200 (application/json)

        {
        }

+ Response 404 (application/json)

    + Body

        ```
        {
        "errors": [
          {
            "message": "resource not found",
            "code": "1600",
            "description": "Template does not exist"
          }
        ]
        }
        ```

+ Response 409 (application/json)

    + Body

        ```
        {
        "errors": [
          {
            "message": "resource conflict",
            "code": "1602",
            "description": "Template is in use by msg generation"
          }
        ]
        }
        ```

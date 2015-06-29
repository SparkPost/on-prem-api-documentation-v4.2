# Group SMTP API

Through use of the X-MSYS-API header in a message sent to SparkPost through SMTP 
(see ["Sending an Email"](https://www.sparkpost.com/docs/sending-email)), you can now specify a campaign id, metadata,
tags, and enable open and/or click tracking.  Note that to use this option you should be familiar with how to encode
options as JSON strings, as the value of the header field is a JSON object that specifies the relevant options:

```
X-MSYS-API: {"options" : {"open_tracking" : false, "click_tracking" : true},
   "metadata" : {"key" : "value"}, "tags" : ["cat", "dog"], "campaign_id" :
   "my_campaign"}
```

The fields supported in the X-MSYS-API header are as follows:

| field | type | description | required | notes |
|-------|------|-------------|----------|-------|
| campaign_id | string | Name of the campaign to associate with the SMTP message | no | Maximum length - 64 bytes (same restriction as the REST API) |
| metadata | JSON object | JSON key value pairs associated with the SMTP message | no | A maximum of 200 bytes of metadata is available during click/open events. |
| tags | JSON array | Array of text labels associated with the SMTP message | no | Tags are available in click/open events. Maximum number of tags is 10 per recipient, 100 system wide. |
| options | JSON object | JSON object in which SMTP API options are defined | no | For a full description, see the Options Attributes. |

## Options Attributes

| field | type | description | required | notes |
|-------|------|-------------|----------|-------|
| open_tracking | boolean | Whether open tracking is enabled for this SMTP message | no | Defaults to false. |
| click_tracking | boolean | Whether click tracking is enabled for this SMTP message | no | Defaults to false. |
| sandbox|boolean|Whether or not to use the sandbox sending domain | no |Defaults to false.|

SMTP defines a maximum line length of 1000 characters (including CRLF).  If the value of the X-MSYS-API JSON string is
longer than 998 characters, it will need to be folded across multiple lines before the message is injected.  An example
of a folded header:

```
X-MSYS-API: {"options" : {"open_tracking" : false, "click_tracking" : true},
   "metadata" : {"key" : "value"}, "tags" : ["cat", "dog"], "campaign_id" :
   "my_campaign"}
```

Be aware that when the header is unfolded on the receiving system, as per rfc2822 (https://www.ietf.org/rfc/rfc2822.txt),
a single space will be added between each line of the header.

For example:

```
X-MSYS-API: {"options" : {"open_tracking" : false }, "campaign_id" : "my_awes
   ome_campaign" }
```

Will be unfolded as

```
X-MSYS-API: {"options" : {"open_tracking" : false }, "campaign_id" : "my_awes ome_campaign" }
```

Note the space that was introduced in the "my_awes ome_campaign" string.

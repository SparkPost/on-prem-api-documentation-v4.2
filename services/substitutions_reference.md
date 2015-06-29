## Substitutions Reference

### Key Features

* Substitutions applied in top-level headers, text/plain, and text/html parts
* Key/value substitutions using substitution data provided in an arbitrary JSON object format
* Conditional statements such as if, then, else, elseif
* Looping over JSON arrays using each
* Execution of built-in macros
* Support for default values provided as a backup for substitution data that does not exist
* Automatic HTML escaping of substitution values appearing in HTML parts of content
* Automatic encoding of UTF-8 substitution values appearing in email headers

### Substitution Data

Substitutions are applied per recipient using substitution data provided as part of
the transmission and recipient JSON structures.  In the simplest case, substitution data is a JSON
object of key/value pairs of recipient-specific data.  In a more complex case,
the substitution data can consist of nested JSON objects and even arrays of objects.
This allows the template writer to write statements that loop over an array of JSON objects
and substitute values that exist in each object in the array, for example, an array of customer orders.

The following is a simple example of JSON substitution data:

```
{
  "name" : "Clark",
  "age" : 40,
  "state" : "MD",
  "is_member" : true
}
```

See the examples in the following sections for more complex substitution data structures.

**UTF-8 support**: UTF-8 substitution *values* are supported, but UTF-8 substitution *keys* are not supported.

Substitution keys can be composed of any string of US-ASCII letters,
digits, and underscores, not beginning
with a digit, with the exception of the following keywords:

* and, break, do, else, elseif
* end, false, for, function, if
* in, local, nil ,not, or ,each
* repeat, return, then, true, until, while

**Metadata**: Transmissions and recipients also support a "metadata" JSON object.
Metadata can be used in substitutions in the same way as substitution data.




### Template Start and End Markers

As with some other templating languages, the start and end markers are defined as double curly braces.  For example:

```
{{value}}
```

Whitespace within the braces is ignored.  All of the following are equivalent:

```
{{ value }}
{{value}}
{{  value   }}
```

**Note**

However, no spaces are allowed when substitution data is used in a query string.
In the following example, no whitespace is allowed within the braces:

```
<a href="https://company.com/dailydeals?user={{user}}&offercode={{offercode}}">
Check out the amazing offers for today ONLY!
</a>
```

In all cases, the two braces must be adjacent, and there can be no space between them.
The following will not be interpreted as a template:

```
{ { value } }
```

### Determination of Expressions and Statements

When compiling a template, the substitution engine looks at the text between each pair of curly braces
and determines whether it should be treated as an expression or a statement.  The
difference being, expressions return a value, and statements do not return a value.
However, there is no need to use a different syntax when writing an expression
(as is done in some templating languages).

Expressions return values that are inserted into the template content.  The following are examples:

```
{{ name }}
{{ age }}
{{ airports[code].city }}
{{ name or 'Customer' }}
```
 
Statements do not return a value but implement logic using keywords such as if, else, not, end,
each.  The following are examples:

```
{{ if name == "Clark" }}
{{ if empty(myarray) }}
{{ each orders }}
{{ end }}
```

### Missing Substitution Values

An empty string is substituted for keys that do not appear in the substitution
data or are present in the substitution data but have a value of JSON null.

When `name` does not exist, the following example will render as **Hello []**. 

```
Hello [{{ name }}]
```

When `name` is null, the following expression resolves to **You don't have a name!**: 

```
{{ if name }}
Your name is {{name}}
{{ else }}
You don't have a name!
{{ end }}
```

When the orders array is null, nothing is rendered in the following example:

```
{{ each orders }}
Price is {{loop_var}}
{{ end }}
```

### Statements on Their Own Line
Substitution statements that exist on their own line of the template will **not**
produce a blank line in the resulting output.  This is a convenience to the
template writer.  In addition, any whitespace after the closing **}}** and before
the `LF` or `CRLF` will **not** be present in the output. 

**Note**

These rules do not apply to substitution expressions.

In the following example, the template will render without blank lines: 

```
Start of template
{{ if state == "MD" }}
Maryland
{{ end }}
End of template
```

Yielding the output:

```
Start of template
Maryland
End of template
```

### Escaping Start and End Tags

If you want a pair of opening or closing braces to appear in the content,
you must escape them.  Use one of the following macros:

* `opening_double_curly()`
* `closing_double_curly()`
* `opening_triple_curly()`
* `closing_triple_curly()`

For example:

```
Here is a curly: {{ opening_double_curly() }}
```

will yield:

```
Here is a curly: {{
```

### Escaping HTML Values

The substitution engine automatically HTML escapes substitution values before they are
inserted into the HTML part of the content.  Substitution values inserted into
plain text portions of content are not HTML escaped.  In order to prevent
HTML escaping, use triple curly braces.

### Preventing HTML Escaping

The substitution engine supports triple curly braces to signify that HTML escaping should not occur.

Example substitution data: 

```
{
  "custom_html": "<p>Hello</p>"
}
```

Example template HTML part:

```
<body>
{{{ custom_html }}}
</body>
```

Example of the resulting rendered HTML:

```
<body>
<p>Hello</p>
</body>
```

Example of using double curly braces renders angle brackets incorrectly:

```
<body>
&lt;p&gt;Hello&lt;/p&gt;
</body>
```

### Personalized Links

Personalized links are supported.  A personalized link is defined as a target link that has one or more substitutions.
For example:

```
<a href="https://company.com/dailydeals?user={{user}}&offercode={{offercode}}">Go!</a>
```

In this case `{{user}}` and `{{offercode}}` are the items taken from the substitution data or metadata. 

The substitution engine automatically URL encodes substitution values before they are
inserted into URLs.  For example, if 'user' and 'offercode' are defined in the substitution_data as

```
{
  "user" : "Spark Post",
  "offercode" : "ABC/ZYZ"
}
```

Then the above URL will be correctly rendered as
```
<a href="https://company.com/dailydeals?user=Spark%20Post&offercode=ABC%2FZYZ">Go!</a>
```

In order to disable URL encoding, use triple curly braces.  This is useful if you
have an entire URL suffix which needs to be substituted.  For example:

```
<a href="http://www.company.com/{{{the_entire_suffix}}}">Go</a>
```

where the substitution_data looks like:

```
{
  "the_entire_suffix" : "groups/join?user=clark"
}
```

Since triple curlies are used, the substitution value will *not* be URL encoded
and the URL will render as expected:

```
<a href="http://www.company.com/groups/join?user=clark">Go</a>
```

Triple curlies are also necessary if the entire URL resides in substitution data:

```
{
  "the_entire_url" : "http://www.company.com/dailydeals?user=foo&offercode=bar"
}
```

This URL can be inserted into the template using triple curlies:

```
<a href="{{{the_entire_url}}}">Go!</a>
```

### Link Names

Name all links using the **data-msys-linkname** custom attribute.  The link name has a maximum length of 63 characters and is truncated if it exceeds that limit. For example:

```
<a href="http://www.example.com" data-msys-linkname="banner">Example</a>
```

If this attribute is not specified, the link name will fall back to **Raw URL**.

The link name will be incorporated into the click-tracked link and will be tracked in engagement events.

### Substitutions Syntax Examples

This section contains syntax examples based on the following JSON substitution data:

```
{
  "name": "Clark Griswold",
  "address": {
    "street": "Hemlock",
    "number": "203A",
    "city": "Chicago",
    "state": "IL"
  },
  "age": 40,
  "signed_up": true,
  "rejected_sign_up": false,
  "children": [
    "Rusty",
    "Audrey"
  ],
  "shopping_cart": [
    {
      "item_name": "Jacket",
      "price": 39.99,
      "a_nested_array": [
        {
          "key": "v2"
        },
        {
          "key": "v1"
        }
      ]
    },
    {
      "item_name": "Gloves",
      "price": 5.00
    }
  ]
}
```

#### Basic Substitution

```
Hello {{name}}
```

#### Referencing a Nested Object

```
Street: {{address.street}}
```

#### if then else Syntax

Notice the "then" is not required.  The following are equivalent: 

```
{{if signed_up}}
Welcome
{{else}}
Don't forget to sign up!
{{end}}

{{if signed_up then}}
Welcome
{{else}}
Don't forget to sign up!
{{end}}
```

#### if not Syntax

```
{{if not signed_up}}
Don't forget to sign up!
{{end}}
```

#### elseif Syntax

```
{{if signed_up}}
Welcome
{{elseif rejected_sign_up}}
We won't bug you
{{else}}
Please sign up
{{end}}
```

#### Expressions in Conditionals (`==`, `!=`, `<`, `>`, `and`, `or`)

```
{{if age > 30}}
do something
{{else}}
do something else
{{end}}

{{if address.state == "MD"}}
do something
{{end}}

-- multi part conditionals
{{if age > 30 and address.state == "MD"}}
do something
{{end}}
```

### Relational and Logical Operators

The relational and logical operators are as follows: 

**Relational Operators**

| Expression | Description |
| ---------- |-------------|
| x == y | x is equal to y |
| x != y | x is not equal to y |
| x < y | x is less than y |
| x > y | x is greater than y |
| x <= y | x is less than or equal to y |
| x >= y | x is greater than or equal to y |

**Logical Operators**

| Expression |
| ------------- |
| and |
| or |
| not |

### Array Iteration

The substitution language uses the `each` keyword for iteration.
The value at each index of an array can be accessed within the each loop by using the `loop_var` variable. When using the `each` keyword to iterate over an array, the `loop_index` variable can be used to get the current index.

**Note**

These examples continue to use the sample data given above.

For example, use the following syntax to iterate over a JSON array of strings
(children) and print out the value of each string:

```
{{ each children }}
You have a child named {{loop_var}}
{{ end }}
```

To iterate over an array of objects, the syntax is the same,
but access to the nested fields of the object is done using dot notation:

```
Your shopping cart has items in it:

{{each shopping_cart}}
Item: {{loop_var.item_name}}, Price: {{loop_var.item_price}}
{{end}}
```

Nested loops are possible.  When nested loops are in use, loop variables must
be accessed using `loop_vars.<name of the array>` (notice it is plural `loop_vars` and not `loop_var`).
The following example uses `shopping_cart` and `a_nested_array`: 

```
{{each shopping_cart}}
  Item: {{loop_vars.shopping_cart.item_name}}, Price: {{loop_vars.shopping_cart.item_price}}
  This item has the following nested values:
  {{each loop_vars.shopping_cart.a_nested_array}}
    Nested value: {{loop_vars.a_nested_array.key}}
  {{end}}
{{end}}
```

**Note** 

The preceding example uses indentation for ease of reading.
The indentation will appear in the rendered content, so it is not advisable to indent a production template. 

### Links and Substitution Expressions Within Substitution Values

Sometimes it may be convenient to place links and substitution expressions not only within
a template, but within substitution values themselves.  For example, the 'my_html_chunk' substitution value
below contains a link as well as a substitution expression referencing a username:

```

{
  "substitution_data" : {
    "my_html_chunk" : "<p><a href = \"http://www.example.com?q={{username}}\">Click here</a></p>",
    "username" : "foo"
  }
}
```

By default, this will not work. In general, the rules are as follows:

* Links within substitution values are *not* automatically converted to click trackable links.
* Substitution expressions within substitution values are *not* automatically executed.

Using the above substitution_data and the following template:

```
<body>
<p>Attempting to insert a chunk of html:</p>
{{{ my_html_chunk }}}
</body>
```

Will result in the following unexpected rendered content:

```
<body>
<p>Attempting to insert a chunk of html:</p>
<p><a href = "http://www.example.com?q={{username}}">Click here</a></p>
</body>
```

Notice that the **username** variable was not replaced
and the link was not converted into a click trackable form.

In order to correct this problem, the system must be informed of the need to perform such
substitutions and link tracking.  This can be accomplished with two steps:

1) The html chunk must be specified in the transmission level substitution data underneath a special
`dynamic_html` json object.  All key value pairs underneath dynamic_html will undergo substitutions as well
as link tracking.

In the above example, the transmission level substitution data would need to be structured as:

```
{
  "substitution_data" : {
    "dynamic_html" : {
      "my_html_chunk" : "<p><a href = \"http://www.example.com?q={{username}}\">Click here</a></p>"
    }
  }
}
```

2) The render_dynamic_content() macro must be used to wrap all uses of dynamic_html variables.
Continuing with the example above, the template would
need to be structured as:

```
<body>
<p>Attempting to insert a chunk of html:</p>
{{ render_dynamic_content(dynamic_html.my_html_chunk) }}
</body>
```

Note: The dynamic content will be correctly inserted *without* html escaping,
regardless of whether double or triple curly braces are used.  There is no need to use triple curly braces in this case.


To insert dynamic content into the text/plain part of a message, one must place the dynamic content into the transmission
level substitution variable `dynamic_plain`.  For example:

```
{
  "substitution_data" : {
    "dynamic_plain" : {
      "my_plain_text_chunk" : "A chunk of plain text content with a link and a substitution. http://www.example.com?q={{username}}"
    }
  }
}
```

As with dynamic_html, dynamic_plain variables must be wrapped in the render_dynamic_content() macro when used
in the template:

```
Attempting to insert a chunk of plain text:
{{ render_dynamic_content(dynamic_plain.my_plain_text_chunk) }}
```

Finally, as a more realistic example, render_dynamic_content can also be used inside an 'each' loop.
A full transmission json example follows:

```
{
  "recipients": [
    {
      "address": {
        "email": "foo@example.com"
      },
      "substitution_data": {
        "name": "The A-Team",
        "offers": [ "offer2", "offer1" ]
      }
    },
    {
      "address": {
        "email": "bar@example.com"
      },
      "substitution_data": {
        "name": "Johnnie Rico",
        "offers": [ "offer3" ]
      }
    }
  ],
  "substitution_data": {
    "dynamic_html": {
      "offer1": "<a href=\"http://t.com/offer/1?name={{name}}\">Premium-brand wirecutters</a>",
      "offer2": "<a href=\"http://t.com/offer/2?name={{name}}\">Corks</a>",
      "offer3": "<a href=\"http://t.com/offer/3?name={{name}}\">Super-effective bug spray</a>"
    },
    "dynamic_plain": {
      "offer1": "Premium-brand wirecutters -- http://t.com/offer/1?name={{name}}",
      "offer2": "Corks -- http://t.com/offer/2?name={{name}}",
      "offer3": "Super-effective bug spray -- http://t.com/offer/3?name={{name}}"
    }
  }
  "content": {
    "text": "Today's special offers:\n\n{{each offers}}\n* {{render_dynamic_content(dynamic_plain[loop_var])}}\n{{end}}\n",
    "html": "<p>Today's special offers</p><ul>\n{{each offers}}\n<li>{{render_dynamic_content(dynamic_html[loop_var])}}</li>\n{{end}}\n</ul>",
    "from": "test@example.com",
    "subject": "offers"
  }
}
```

### Default Values

To create default values, use `or` syntax.  In the following example,
if `name` does not exist as a substitution key, then the expression `null or 'Customer'`
will evaluate as `Customer`.

```
Hello {{ name or 'Customer' }}
```

### Macros

Macros are function calls that may or may not take arguments.  The currently available macros are:

**empty**

This function takes a JSON array as an argument and returns true if the array is empty or false if the array is not empty.
This is useful for determining whether to include a header in a dynamically
generated HTML table and blocking iteration of the table if it is empty.

Example:

```
{{ if not empty(shopping_cart) }}
<table border = "1">
<tr>
<th>Name</th>
<th>Price</th>
</tr>
{{ each shopping_cart }}
<tr>
<td>{{loop_var.item_name}}</td>
<td>${{loop_var.item_price}}</td>
</tr>
{{ end }}
</table>
{{ else }}
<b>Buy something!</b>
{{ end }}
```

**Braces Macros**

The four macros for outputting braces are listed below followed by their output:

* `opening_double_curly()` - {{
* `closing_double_curly()` - }}
* `opening_triple_curly()` - {{{
* `closing_triple_curly()` - }}}



###  Reserved Recipient Substitution Variables

The following substitution variables are reserved
automatically available for each recipient:

* `address.name`: Recipient's name from the _address.name_ recipient json field
* `email` and `address.email`: Recipient's email address from the _address_ or _address.email_ recipient json field

Example:

```
Hello {{address.name}}
Your email is {{address.email}}
```

### Substitutions in email_rfc822 Headers

When it is desirable to have substitutions in RFC2047 encoded headers which are folded, be sure that
each line of the header is separately RFC2047 encoded.  Otherwise, the server will not be able to decode
the header to look for substitution syntax.

**Correct:**

```
Subject: =?gb2312?B?ztLE3M3Mz8Kyo8Gntviyu8nLye3M5c7SxNzNzM/CsqPBp7b4srvJy8ntzOU=?=
   =?gb2312?B?ztLE3M3Mz8Kyo8Gntvg=?= 
```

**Incorrect:**

```
Subject: =?gb2312?B?ztLE3M3Mz8Kyo8Gntviyu8nLye3M5c7SxNzNzM/CsqPBp7b4srvJy8ntzOU=
   ztLE3M3Mz8Kyo8Gntvg=?=
```

### Encoding Rules

* If after substitution, a text/plain or text/html part contains 8-bit data,
then that part will be quoted-printable encoded before being placed back into the
MIME structure.  The Content-Type will be updated appropriately.
* If after substitution, a header value contains 8-bit data, then the header
value will be RFC2047 base64 encoded before being written back to the headers structure.

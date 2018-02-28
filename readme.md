# Fill-In-The-Blanks API
## Main URL:
https://rich-media-fill-in-the-blanks.herokuapp.com/

##Endpoints:

**[GET/HEAD] {url}/template**
Retrieves a template or a blank copy of the game sheet. The HEAD version returns with only a status code.

**Query Parameters:**
|Query Parameter|Required|Description|
|---|---|---|
|name|true|The name of the template being retrieved.|

**Response Body:**
|XML|Description|
|---|---|
|template|Element containing the template information.|
|name attribute|Contains the unique name for the template.|
|category attribute|Contains a category name used for filtering templates.|
|title|Holds the text for the display title for the template.|
|line|A line of displayed text.|
|blank|A blank line to be filled in by the player.|
|type attribute|Information on what type of word goes in the blank, acts as a 'hint' for players.|
The JSON splits the XML elements into JSON with the following structure:
{ "type":" ", "name":" ", "attributes": " ", "elements": [] }
|JSON|Description|
|---|---|
|type|The type of the XML - "element" for an XML or "text" for raw text|
|name|The name of the XML element ex. "template" or "title"|
|attributes|A JSON object containing the XML element's attributes|
|elements|An array containing the children elements/nodes of this XML element|

**Response Body Examples:**
XML:
```XML
<template name="row-your-boat" category="children">
    <title>Row Your 
        <blank type="noun"/>
    </title>
    <line>
        <blank type="verb"/>,
        <blank type="same verb"/> your boat
        <blank type="adverb"/> down the stream.
    </line>
    <line>Merrily, merrily, merrily 
        <blank type="noun"/> is such a
        <blank type="noun"/>.
    </line>
</template>
```
JSON - *based on non-compact form generated by [xml-js](https://www.npmjs.com/package/xml-js)*:
```JSON
{
    "type": "element",
    "name": "template",
    "attributes": {
        "name": "row-your-boat",
        "category": "children"
    },
    "elements": [
        {
            "type": "element",
            "name": "title",
            "elements": [
                {
                    "type": "text",
                    "text": "Row Your "
                },
                {
                    "type": "element",
                    "name": "blank",
                    "attributes": {
                        "type": "noun"
                    }
                }
            ]
        },
        {
            "type": "element",
            "name": "line",
            "elements": [
                {
                    "type": "element",
                    "name": "blank",
                    "attributes": {
                        "type": "verb"
                    }
                },
                {
                    "type": "text",
                    "text": ", "
                },
                {
                    "type": "element",
                    "name": "blank",
                    "attributes": {
                        "type": "same verb"
                    }
                },
                {
                    "type": "text",
                    "text": " your boat "
                },
                {
                    "type": "element",
                    "name": "blank",
                    "attributes": {
                        "type": "adverb"
                    }
                },
                {
                    "type": "text",
                    "text": " down the stream."
                }
            ]
        },
        {
            "type": "element",
            "name": "line",
            "elements": [
                {
                    "type": "text",
                    "text": "Merrily, merrily, merrily "
                },
                {
                    "type": "element",
                    "name": "blank",
                    "attributes": {
                        "type": "noun"
                    }
                },
                {
                    "type": "text",
                    "text": " is such a "
                },
                {
                    "type": "element",
                    "name": "blank",
                    "attributes": {
                        "type": "noun"
                    }
                },
                {
                    "type": "text",
                    "text": "."
                }
            ]
        }
    ]
}
```

**Error Codes**
200 - Success: The template was retrieved correctly.
400 - Bad Request: Some of the query parameters were missing or were invalid.
404 - Not Found: The requested template could not be found.
500 - Internal Server Error: The server had trouble communicating with the database.

**[POST] {url}/template**
Sends a template to the database. If there is an existing template with that name in the database the server updates the existing template, otherwise it deletes it.

**Request Body**
|XML|Description|
|---|---|
|template|Element containing the template information.|
|name attribute|Contains the unique name for the template.|
|category attribute|Contains a category name used for filtering templates.|
|title|Holds the text for the display title for the template.|
|line|A line of displayed text.|
|blank|A blank line to be filled in by the player.|
|type attribute|Information on what type of word goes in the blank, acts as a 'hint' for players.|
The JSON splits the XML elements into JSON with the following structure:
{ "type":" ", "name":" ", "attributes": " ", "elements": [] }
|JSON|Description|
|---|---|
|type|The type of the XML - "element" for an XML or "text" for raw text|
|name|The name of the XML element ex. "template" or "title"|
|attributes|A JSON object containing the XML element's attributes|
|elements|An array containing the children elements/nodes of this XML element|
The JSON element must start with an elements tag on the top level to be parsed properly.

**Request Body Examples**
XML:
```XML
<template name="example1" category="examples">
  <title>Example 1</title>
  <line>This is a <blank type="adjective"/> example.</line>
</template>
```
JSON:
```JSON
{"elements":[{"type":"element","name":"template","attributes":{"name":"example1","category":"examples"},"elements":[{"type":"element","name":"title","elements":[{"type":"text","text":"Example 1"}]},{"type":"element","name":"line","elements":[{"type":"text","text":"This is a "},{"type":"element","name":"blank","attributes":{"type":"adjective"}},{"type":"text","text":" example."}]}]}]}
```

**Error Codes**
201 - Created: Successfully created a new template.
204 - No Content: Successfully updated an existing tempate. A response body is not provided.
400 - Bad Request: The request body was invalid.
500 - Internal Server Error: The server had trouble communicating with the database.

**[GET/HEAD] {url}/templateList**
Fetches a list of templates from the server.

**Query Parameters**
|Parameter|Required|Description|
|---|---|---|
|Category|False|Optional parameter. If present the call will only include elements with that category.|

**Response Headers**
|Header|Description|
|---|---|
|count|The number of elements in the returned list, or the number of elements that would be returned for a HEAD request.||

**Response Body**
|XML|Description|
|---|---|
|Templates|An XML element containing the list of templates.|
|template|Element containing the template information.|
|name attribute|Contains the unique name for the template.|
|category attribute|Contains a category name used for filtering templates.|
|title|Holds the text for the display title for the template.|
|line|A line of displayed text.|
|blank|A blank line to be filled in by the player.|
|type attribute|Information on what type of word goes in the blank, acts as a 'hint' for players.|
The JSON splits the XML elements into JSON with the following structure:
{ "type":" ", "name":" ", "attributes": " ", "elements": [] }
|JSON|Description|
|---|---|
|type|The type of the XML - "element" for an XML or "text" for raw text|
|name|The name of the XML element ex. "template" or "title"|
|attributes|A JSON object containing the XML element's attributes|
|elements|An array containing the children elements/nodes of this XML element|

**Response Body Example**
XML:
```XML
<templates>
    <template name="classical-music" category="arts-and-culture">
        <title>5 
            <blank uppercase="true" type="adjective"/> Classical
            <blank uppercase="true" type="plural noun"/>
        </title>
        <line>1. Ode to 
            <blank uppercase="true" type="emotion"/> by
            <blank uppercase="true" type="proper name"/>
        </line>
        <line>2. The 
            <blank uppercase="true" type="number"/> Seasons by
            <blank uppercase="true" type="proper name"/>
        </line>
        <line>3. Moonlight 
            <blank uppercase="true" type="noun"/> by
            <blank uppercase="true" type="proper name"/>
        </line>
        <line>4. 
            <blank uppercase="true" type="animal"/>
            <blank uppercase="true" type="noun"/> by
            <blank uppercase="true" type="proper name"/>
        </line>
        <line>5. The 
            <blank uppercase="true" type="adjective"/>
            <blank uppercase="true" type="instrument"/> by
            <blank uppercase="true" type="proper name"/>
        </line>
    </template>
    <template name="row-your-boat" category="children">
        <title>Row Your 
            <blank type="noun"/>
        </title>
        <line>
            <blank type="verb"/>,
            <blank type="same verb"/> your boat
            <blank type="adverb"/> down the stream.
        </line>
        <line>Merrily, merrily, merrily 
            <blank type="noun"/> is such a
            <blank type="noun"/>.
        </line>
    </template>
</templates>
```
JSON:
```JSON
[
    {
        "type": "element",
        "name": "template",
        "attributes": {
            "name": "classical-music",
            "category": "arts-and-culture"
        },
        "elements": [
            {
                "type": "element",
                "name": "title",
                "elements": [
                    {
                        "type": "text",
                        "text": "5 "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "adjective"
                        }
                    },
                    {
                        "type": "text",
                        "text": " Classical "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "plural noun"
                        }
                    }
                ]
            },
            {
                "type": "element",
                "name": "line",
                "elements": [
                    {
                        "type": "text",
                        "text": "1. Ode to "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "emotion"
                        }
                    },
                    {
                        "type": "text",
                        "text": " by "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "proper name"
                        }
                    }
                ]
            },
            {
                "type": "element",
                "name": "line",
                "elements": [
                    {
                        "type": "text",
                        "text": "2. The "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "number"
                        }
                    },
                    {
                        "type": "text",
                        "text": " Seasons by "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "proper name"
                        }
                    }
                ]
            },
            {
                "type": "element",
                "name": "line",
                "elements": [
                    {
                        "type": "text",
                        "text": "3. Moonlight "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "noun"
                        }
                    },
                    {
                        "type": "text",
                        "text": " by "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "proper name"
                        }
                    }
                ]
            },
            {
                "type": "element",
                "name": "line",
                "elements": [
                    {
                        "type": "text",
                        "text": "4. "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "animal"
                        }
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "noun"
                        }
                    },
                    {
                        "type": "text",
                        "text": " by "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "proper name"
                        }
                    }
                ]
            },
            {
                "type": "element",
                "name": "line",
                "elements": [
                    {
                        "type": "text",
                        "text": "5. The "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "adjective"
                        }
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "instrument"
                        }
                    },
                    {
                        "type": "text",
                        "text": " by "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "uppercase": "true",
                            "type": "proper name"
                        }
                    }
                ]
            }
        ]
    },
    {
        "type": "element",
        "name": "template",
        "attributes": {
            "name": "row-your-boat",
            "category": "children"
        },
        "elements": [
            {
                "type": "element",
                "name": "title",
                "elements": [
                    {
                        "type": "text",
                        "text": "Row Your "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "type": "noun"
                        }
                    }
                ]
            },
            {
                "type": "element",
                "name": "line",
                "elements": [
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "type": "verb"
                        }
                    },
                    {
                        "type": "text",
                        "text": ", "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "type": "same verb"
                        }
                    },
                    {
                        "type": "text",
                        "text": " your boat "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "type": "adverb"
                        }
                    },
                    {
                        "type": "text",
                        "text": " down the stream."
                    }
                ]
            },
            {
                "type": "element",
                "name": "line",
                "elements": [
                    {
                        "type": "text",
                        "text": "Merrily, merrily, merrily "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "type": "noun"
                        }
                    },
                    {
                        "type": "text",
                        "text": " is such a "
                    },
                    {
                        "type": "element",
                        "name": "blank",
                        "attributes": {
                            "type": "noun"
                        }
                    },
                    {
                        "type": "text",
                        "text": "."
                    }
                ]
            }
        ]
    }
]
```

**Error Codes**
200 - Success: The template list was retrieved successfully.
500 - Internal Server Error: The server had trouble communicating with the database.

**[GET/HEAD] {url}/sheet**
Retrieves a sheet (a data object containing information about what words go into the blanks in a template). The HEAD version only returns a status code.

**Query Parameters**
|Parameter|Required|Description|
|---|---|---|
|Name|True|The name of the saved sheet, used to filter results.|
|Template|True|The name of the template this sheet is associated with. Used to filter results.|

**Response Body**
|XML/JSON|Description|
|---|---|
|sheet|XML object containing the sheet information.|
|name|The name of the sheet.|
|template|The associated template.|
|words| An object containing the words to be inserted into the tempate.|
|word[n]| The (n+1)th word to be added to the template.|

**Response Body Examples**
XML:
```XML
<sheet>
    <name>1-1</name>
    <template>example1</template>
    <words>
        <word0>cat</word0>
        <word1>dog</word1>
    </words>
</sheet>
```
JSON:
```JSON
{"name":"1-1","template":"example1","words":{"word0":"cat","word1":"dog"}}
```

**Error Codes**
200 - Success: The sheet was retrieved correctly.
400 - Bad Request: Some of the query parameters were missing or were invalid.
404 - Not Found: The requested sheet could not be found.
500 - Internal Server Error: The server had trouble communicating with the database.

**[POST] {url}/sheet**
Adds a new sheet to the database or updates an old one.

**Request Body**
|XML/JSON|Description|
|---|---|
|sheet|XML object containing the sheet information.|
|name|The name of the sheet.|
|template|The associated template.|
|words| An object containing the words to be inserted into the tempate.|
|word[n]| The (n+1)th word to be added to the template.|

**Error Codes**
201 - Created: Successfully created a new sheet.
204 - No Content: Successfully updated an existing sheet. A response body is not provided.
400 - Bad Request: Some of the query parameters were missing or were invalid.
500 - Internal Server Error: The server had trouble communicating with the database.

**[GET/HEAD] /sheetList**
Retrieves a list of sheets from the database.

**Query Parameters**
|Parameter|Required|Description|
|---|---|---|
|template|False|Optional parameter. If present the call will only include elements connected to the given template.|

**Response Headers**
|Header|Description|
|---|---|
|count|The number of elements in the returned list, or the number of elements that would be returned for a GET request (when called as a HEAD request).||

**Response Body**
|XML/JSON|Description|
|---|---|
|sheets|An XML object containing all the sheets.|
|sheet|XML object containing information for a sheet.|
|name|The name of the sheet.|
|template|The associated template.|
|words| An object containing the words to be inserted into the tempate.|
|word[n]| The (n+1)th word to be added to the template.|

**Response Body Example**
XML:
```XML
<sheets>
    <sheet>
        <name>1-1</name>
        <template>example1</template>
        <words>
            <word0>a</word0>
            <word1>b</word1>
            <word2>c</word2>
        </words>
    </sheet>
    <sheet>
        <name>1-2</name>
        <template>example1</template>
        <words>
            <word0>a</word0>
            <word1>b</word1>
            <word2>c</word2>
        </words>
    </sheet>
</sheets>
```
JSON:
```JSON
[
    {
        "_id": "5a96b4597769eeb02eb083cb",
        "name": "1-1",
        "template": "example1",
        "words": {
            "word0": "a",
            "word1": "b",
            "word2": "c"
        }
    },
    {
        "_id": "5a96b4717769eeb02eb0847f",
        "name": "1-2",
        "template": "example1",
        "words": {
            "word0": "a",
            "word1": "b",
            "word2": "c"
        }
    }
]
```

**Error Codes**
200 - The sheet list was retrieved correctly.
500 - Internal Server Error: The server had trouble communicating with the database.

[GET/HEAD] /example
Gets example XML/JSON input for the [POST] /template request. /exampleXML fetches the XML version only and /exampleJSON calls the JSON version only.

**Response Body**
|XML|Description|
|---|---|
|template|Element containing the template information.|
|name attribute|Contains the unique name for the template.|
|category attribute|Contains a category name used for filtering templates.|
|title|Holds the text for the display title for the template.|
|line|A line of displayed text.|
|blank|A blank line to be filled in by the player.|
|type attribute|Information on what type of word goes in the blank, acts as a 'hint' for players.|
The JSON splits the XML elements into JSON with the following structure:
{ "type":" ", "name":" ", "attributes": " ", "elements": [] }
|JSON|Description|
|---|---|
|type|The type of the XML - "element" for an XML or "text" for raw text|
|name|The name of the XML element ex. "template" or "title"|
|attributes|A JSON object containing the XML element's attributes|
|elements|An array containing the children elements/nodes of this XML element|
The JSON element must start with an elements tag on the top level to be parsed properly.

**Response Body Examples**
XML:
```XML
<template name="example1" category="examples">
  <title>Example 1</title>
  <line>This is a <blank type="adjective"/> example.</line>
</template>
```
JSON:
```JSON
{"elements":[{"type":"element","name":"template","attributes":{"name":"example1","category":"examples"},"elements":[{"type":"element","name":"title","elements":[{"type":"text","text":"Example 1"}]},{"type":"element","name":"line","elements":[{"type":"text","text":"This is a "},{"type":"element","name":"blank","attributes":{"type":"adjective"}},{"type":"text","text":" example."}]}]}]}
```

**Error Codes**
200 - Success: The example was returned successfully.
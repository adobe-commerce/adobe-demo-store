This fork was created from the hlxsites/aem-boilerplate-commerce for Adobe Summit 2025.

It is being archived.

Code: this repo
Content: https://da.live/#/adobe-commerce/archived-adobe-demo-store
Config: 

```
{
	"version": 1,
	"code": {
		"owner": "adobe-commerce",
		"repo": "adobe-demo-store",
		"source": {
			"type": "github",
			"url": "https://github.com/adobe-commerce/adobe-demo-store"
		}
	},
	"content": {
		"source": {
			"url": "https://content.da.live/adobe-commerce/adobe-demo-store/",
			"type": "markup"
		}
	},
	"folders": {
		"/products/": "/products/default",
		"/apparel": "/categories/default",
		"/office": "/categories/default",
		"/lifestyle": "/categories/default",
		"/bags": "/categories/default",
		"/collections": "/categories/default"
	},
	"sidekick": {
		"project": "Boilerplate",
		"editUrlLabel": "Document Authoring",
		"editUrlPattern": "https://da.live/edit#/adobe-commerce/adobe-demo-store{{pathname}}",
		"plugins": [
		]
	},
	"headers": {
		"/**": [
			{
				"key": "access-control-allow-origin",
				"value": "*"
			}
		]
	}
}
```

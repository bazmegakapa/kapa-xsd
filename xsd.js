define(['objTools', 'xml'], function (objTools, xml) {

	/**
	 * A set of useful XML DOM methods.
	 * @external xml
	 */

	/**
	 * @namespace xsd
	 * @desc A set of useful methods for XSD DOM manipulation/traversal.
	 * @extends external:xml
	 */
	var xsd = objTools.make(xml, 
	/**
	 * @lends xsd
	 */
	{
		/**
		 * The XML Schema namespace URI.
		 * @member {string} xs
		 * @memberof xsd
		 */
		xs: 'http://www.w3.org/2001/XMLSchema',
		/**
		 * The XML Schema Instance namespace URI.
		 * @member {string} xsi
		 * @memberof xsd
		 */
		xsi: 'http://www.w3.org/2001/XMLSchema-instance',
		/**
		 * Find root `element` element with the given name in a document.
		 * Complex types will not be traversed for further elements, only root elements are checked.
		 * @param {Document} doc - The XSD document to search in.
		 * @param {string} name - The name to look for. Will match if the `name` attribute of an `element` is equal to the name given.
		 * @returns {Element|null}
		 */
		findElement: function (doc, name) {
			return _(doc.documentElement.children).find(function (child) {
				return child.namespaceURI === xsd.xs
					&& child.localName === 'element'
					&& child.getAttribute('name') === name;
			});
		},
		/**
		 * Find type definition for the given type in a document.
		 * Searches for `complexType` and `simpleType` elements whose `name` attribute matches the given type.
		 * @param {Document} doc - The XSD document to search in.
		 * @param {string} type - The type to look for.
		 * @returns {Element|null}
		 */
		findTypeDefinition: function (doc, type) {
			var selector = 
				 'complexType[name="' + type + '"],'
				+ 'simpleType[name="' + type + '"]';
			return doc.querySelectorAll(selector);
		},
		/**
		 * Reads the type of the element from its given attribute, resolves namespace URI too.
		 * For example it reads `xs:string` but also resolves the `xs` part into a full namespace URI based on the document the element belongs to.
		 * @param {Element} node - The element whose type we want to know.
		 * @param {string} typeAttr - The name of the attribute that stores the type.
		 * @param {string} [typeAttrNS] - The namespace of the attribute that stores the type.
		 * @returns {{ namespaceURI: string, name: string } | null} The type of the element - an object with a `namespaceURI` and `name` property.
		 */
		getTypeFromNodeAttr: function (node, typeAttr, typeAttrNS) {
			var type = typeAttrNS 
				? node.getAttributeNS(typeAttrNS, typeAttr)
				: node.getAttribute(typeAttr);
			if (type) {
				var parts = type.split(':');
				return {
					namespaceURI: node.lookupNamespaceURI(parts[0]),
					name: parts[1]
				};
			}
			else return null;
		},
		/**
		 * Finds the type that is restricted by the given element (through the use of &lt;restriction&gt;).
		 * @param {Element} node - The element whose parent type we want to know.
		 * @returns {{ namespaceURI: string, name: string } | null} The parent type of the element - an object with a `namespaceURI` and `name` property.
		 */
		getRestrictedType: function (node) {
			var	element = _(node.children).find(function (child) {
				return child.namespaceURI === xsd.xs
					&& child.localName === 'restriction';
			});
			return element ? this.getTypeFromNodeAttr(element, 'base') : null;
		},
		/**
		 * Retrieves the facets this element specifies as a restriction.
		 * @param {Element} node - The element whose facets we want to know.
		 * @returns {Array.<Element>} The facet nodes.
		 */
		findRestrictingFacets: function (node) {
			var	element = _(node.children).find(function (child) {
				return child.namespaceURI === xsd.xs
					&& child.localName === 'restriction';
			});
			return element.children;
		},
		/**
		 * Parses the `minOccurs` and `maxOccurs` attributes of the node given.
		 * Returns values that can be used in Javascript.
		 * @param {Element} xsdNode - The XSD node whose attributes we want to read.
		 * @returns {{ min: number, max: number }} An object with a `max` and `min` property.
		 */
		parseMinMaxOccurs: function (xsdNode) {
			var min = xsdNode.getAttribute('minOccurs');
			if (min === null || min === '') {
				min = 1;
			}
			else {
				min = parseInt(min, 10);
			}
			var max = xsdNode.getAttribute('maxOccurs');
			if (max === null || max === '') {
				max = 1;
			}
			else if (max === 'unbounded') {
				max = Infinity;
			}
			else {
				max = parseInt(max, 10);
			}
			return { min: min, max: max	};
		}
	});

	return xsd;

});
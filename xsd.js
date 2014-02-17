define(['objTools', 'xml'], function () {

	var xsd = objTools.make(xml, {
		xs: 'http://www.w3.org/2001/XMLSchema',
		xsi: 'http://www.w3.org/2001/XMLSchema-instance'
	});

	return xsd;

});
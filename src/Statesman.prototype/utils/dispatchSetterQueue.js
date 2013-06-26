var dispatchSetterQueue = function ( statesman ) {
	statesman.set( statesman._silentSetterPayload, { silent: true });
	statesman._silentSetterPayload = null;

	statesman.set( statesman._setterPayload );
	statesman._setterPayload = null;
};
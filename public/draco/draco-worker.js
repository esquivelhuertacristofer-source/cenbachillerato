/*
 * Worker de Draco servido desde el PROPIO dominio (/draco/draco-worker.js).
 *
 * Por qué existe: el DRACOLoader (three-stdlib, el que usa drei) arma su worker con un Blob
 * (URL blob:) y el CSP de la plataforma no permite workers blob: ni compilar
 * WebAssembly en producción. Este archivo es el mismo código del worker de
 * three-stdlib 2.36 (MIT, DRACOWorker; el DRACOLoader que usa drei) más la carga del decodificador por
 * importScripts desde /draco/: con WASM si la página lo permite (le manda
 * wasmBinary) y, si no, con el decodificador en JavaScript puro.
 * Lo usa LabAtlasCuerpoHumano (atlas-cuerpo-escena.tsx). Draco: Apache 2.0.
 */
var decodificadorCargado = false;
function cargarDecodificador( cfg ) {
	if ( decodificadorCargado ) return;
	decodificadorCargado = true;
	importScripts( cfg && cfg.wasmBinary ? 'draco_wasm_wrapper.js' : 'draco_decoder.js' );
}

  let decoderConfig;
  let decoderPending;
  onmessage = function(e) {
    const message = e.data;
    switch (message.type) {
      case "init":
        decoderConfig = message.decoderConfig;
        decoderPending = new Promise(function(resolve) {
          decoderConfig.onModuleLoaded = function(draco) {
            resolve({ draco });
          };
          cargarDecodificador( decoderConfig );
					DracoDecoderModule(decoderConfig);
        });
        break;
      case "decode":
        const buffer = message.buffer;
        const taskConfig = message.taskConfig;
        decoderPending.then((module) => {
          const draco = module.draco;
          const decoder = new draco.Decoder();
          const decoderBuffer = new draco.DecoderBuffer();
          decoderBuffer.Init(new Int8Array(buffer), buffer.byteLength);
          try {
            const geometry = decodeGeometry(draco, decoder, decoderBuffer, taskConfig);
            const buffers = geometry.attributes.map((attr) => attr.array.buffer);
            if (geometry.index)
              buffers.push(geometry.index.array.buffer);
            self.postMessage({ type: "decode", id: message.id, geometry }, buffers);
          } catch (error) {
            console.error(error);
            self.postMessage({ type: "error", id: message.id, error: error.message });
          } finally {
            draco.destroy(decoderBuffer);
            draco.destroy(decoder);
          }
        });
        break;
    }
  };
  function decodeGeometry(draco, decoder, decoderBuffer, taskConfig) {
    const attributeIDs = taskConfig.attributeIDs;
    const attributeTypes = taskConfig.attributeTypes;
    let dracoGeometry;
    let decodingStatus;
    const geometryType = decoder.GetEncodedGeometryType(decoderBuffer);
    if (geometryType === draco.TRIANGULAR_MESH) {
      dracoGeometry = new draco.Mesh();
      decodingStatus = decoder.DecodeBufferToMesh(decoderBuffer, dracoGeometry);
    } else if (geometryType === draco.POINT_CLOUD) {
      dracoGeometry = new draco.PointCloud();
      decodingStatus = decoder.DecodeBufferToPointCloud(decoderBuffer, dracoGeometry);
    } else {
      throw new Error("THREE.DRACOLoader: Unexpected geometry type.");
    }
    if (!decodingStatus.ok() || dracoGeometry.ptr === 0) {
      throw new Error("THREE.DRACOLoader: Decoding failed: " + decodingStatus.error_msg());
    }
    const geometry = { index: null, attributes: [] };
    for (const attributeName in attributeIDs) {
      const attributeType = self[attributeTypes[attributeName]];
      let attribute;
      let attributeID;
      if (taskConfig.useUniqueIDs) {
        attributeID = attributeIDs[attributeName];
        attribute = decoder.GetAttributeByUniqueId(dracoGeometry, attributeID);
      } else {
        attributeID = decoder.GetAttributeId(dracoGeometry, draco[attributeIDs[attributeName]]);
        if (attributeID === -1)
          continue;
        attribute = decoder.GetAttribute(dracoGeometry, attributeID);
      }
      geometry.attributes.push(decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute));
    }
    if (geometryType === draco.TRIANGULAR_MESH) {
      geometry.index = decodeIndex(draco, decoder, dracoGeometry);
    }
    draco.destroy(dracoGeometry);
    return geometry;
  }
  function decodeIndex(draco, decoder, dracoGeometry) {
    const numFaces = dracoGeometry.num_faces();
    const numIndices = numFaces * 3;
    const byteLength = numIndices * 4;
    const ptr = draco._malloc(byteLength);
    decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
    const index = new Uint32Array(draco.HEAPF32.buffer, ptr, numIndices).slice();
    draco._free(ptr);
    return { array: index, itemSize: 1 };
  }
  function decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute) {
    const numComponents = attribute.num_components();
    const numPoints = dracoGeometry.num_points();
    const numValues = numPoints * numComponents;
    const byteLength = numValues * attributeType.BYTES_PER_ELEMENT;
    const dataType = getDracoDataType(draco, attributeType);
    const ptr = draco._malloc(byteLength);
    decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, dataType, byteLength, ptr);
    const array = new attributeType(draco.HEAPF32.buffer, ptr, numValues).slice();
    draco._free(ptr);
    return {
      name: attributeName,
      array,
      itemSize: numComponents
    };
  }
  function getDracoDataType(draco, attributeType) {
    switch (attributeType) {
      case Float32Array:
        return draco.DT_FLOAT32;
      case Int8Array:
        return draco.DT_INT8;
      case Int16Array:
        return draco.DT_INT16;
      case Int32Array:
        return draco.DT_INT32;
      case Uint8Array:
        return draco.DT_UINT8;
      case Uint16Array:
        return draco.DT_UINT16;
      case Uint32Array:
        return draco.DT_UINT32;
    }
  }

// import { SerialPort } from 'serialport';
// import debug from 'debug';

// const debugLog = debug('dispenser:find-dispenser-port');
// // Define the hardware ID and attribute ID you want to search for
// export const hardwareId = '0403';
// export const attributeId = '6001';

// // Function to find port based on hardware ID and attribute ID
// export async function findDispenserPort(hardwareId: string, attributeId: string) {
// 	try {
// 		debugLog(`Finding dispenser port with hardware ID: ${hardwareId}, and attribute ID: ${attributeId}: %o`, arguments);
// 		const foundPort = (await SerialPort.list()).find((port) => {
// 			return port.vendorId === hardwareId && port.productId === attributeId;
// 		});

// 		if (foundPort) {
// 			return foundPort.path;
// 		} else {
// 			throw new Error('Port not found');
// 		}
// 	} catch (error) {
// 		throw error;
// 	}
// }




import { SerialPort } from 'serialport';
import debug from 'debug';

const debugLog = debug('dispenser:find-dispenser-port');

// Define the hardware ID and attribute ID you want to search for
export const hardwareId = '0403';
export const attributeId = '6001';

// Function to find port based on hardware ID and attribute ID
export async function findDispenserPort(hardwareId, attributeId) {
    try {
        debugLog(`Finding dispenser port with hardware ID: ${hardwareId}, and attribute ID: ${attributeId}`);

        // List all connected serial ports
        const ports = await SerialPort.list();
        debugLog('Available ports:', ports);

        // Find the port with matching vendorId and productId
        const foundPort = ports.find((port) => {
            return port.vendorId === hardwareId && port.productId === attributeId;
        });

        if (foundPort) {
            debugLog('Found dispenser port:', foundPort.path);
            return foundPort.path;
        } else {
            throw new Error(`Port not found for hardware ID: ${hardwareId}, product ID: ${attributeId}`);
        }
    } catch (error) {
        debugLog('Error finding dispenser port:', error);
        throw error;
    }
}
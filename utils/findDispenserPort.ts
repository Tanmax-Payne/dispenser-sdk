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

// Define the fixed serial port path for the Waveshare HAT
// Use '/dev/ttyAMA0' or '/dev/serial0' depending on your Raspberry Pi configuration
export const serialPortPath = '/dev/ttyAMA0'; // or '/dev/serial0'

// Function to get the fixed serial port path
export async function findDispenserPort() {
    try {
        debugLog('Using fixed serial port path for Waveshare HAT:', serialPortPath);
        return serialPortPath;
    } catch (error) {
        debugLog('Error getting serial port path:', error);
        throw error;
    }
}



import { SerialPort } from 'serialport';
import debug from 'debug';

// const debugLog = debug('dispenser:find-printer-port');
// // Define the hardware ID and attribute ID you want to search for
// export const hardwareId = '0403';
// export const attributeId = '6001';

// // Function to find port based on hardware ID and attribute ID
// export async function findPrinterPort(hardwareId: string, attributeId: string) {
// 	try {
// 		debugLog(`Finding printer port with hardware ID: ${hardwareId}, and attribute ID: ${attributeId}: %o`, arguments);
// 		const foundPort = (await SerialPort.list()).find((port) => {
// 			return port.vendorId === hardwareId && port.productId === attributeId;
// 		});

// 		if (foundPort) {
// 			return foundPort.path;
// 		} else {
// 			throw new Error('Printer port not found');
// 		}
// 	} catch (error) {
// 		throw error;
// 	}
// }



// Function to initialize and return the RS232 port (for the printer)
export function getPrinterPort() {
    try {
        debugLog('Initializing RS232 port for printer:', RS232_PORT_PATH);
        return new SerialPort({
            path: RS232_PORT_PATH,
            baudRate: 9600, // Adjust baud rate as needed
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
        });
    } catch (error) {
        debugLog('Error initializing RS232 port:', error);
        throw error;
    }
}
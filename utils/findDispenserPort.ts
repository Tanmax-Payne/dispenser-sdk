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
import fs from 'fs';

const debugLog = debug('dispenser:find-dispenser-port');

// Path to the environment file
const environmentFilePath = '/etc/environment.txt';

// Function to read the environment file and parse variables
function readEnvironmentFile() {
    try {
        const fileContent = fs.readFileSync(environmentFilePath, 'utf8');
        const envVariables = {};

        fileContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVariables[key.trim()] = value.trim();
            }
        });

        return envVariables;
    } catch (error) {
        debugLog('Error reading environment file:', error);
        return {};
    }
}

// Function to find the appropriate dispenser port
export async function findDispenserPort() {
    try {
        debugLog('Attempting to find dispenser port...');

        // Read the environment file
        const envVariables = readEnvironmentFile();

        // Determine the communication method
        const communicationMethod = envVariables.VITE_MAIN_DISPENSER_COMMUNICATION_METHOD;

        if (communicationMethod === 'USB') {
            // Use USB-to-serial adapter
            const hardwareId = envVariables.VITE_MAIN_DISPENSER_HARDWARE_ID;
            const attributeId = envVariables.VITE_MAIN_DISPENSER_ATTRIBUTE_ID;

            if (!hardwareId || !attributeId) {
                throw new Error('USB-to-serial adapter configuration is incomplete');
            }

            debugLog('Searching for USB-to-serial adapter...');
            const foundPort = (await SerialPort.list()).find((port) => {
                return port.vendorId === hardwareId && port.productId === attributeId;
            });

            if (foundPort) {
                debugLog('USB-to-serial adapter found:', foundPort.path);
                return foundPort.path;
            } else {
                throw new Error('USB-to-serial adapter not found');
            }
        } else if (communicationMethod === 'HAT') {
            // Use Waveshare HAT
            const hatPortPath = envVariables.VITE_MAIN_DISPENSER_HAT_PORT || '/dev/ttyAMA0';
            debugLog('Using Waveshare HAT with port:', hatPortPath);
            return hatPortPath;
        } else {
            throw new Error('Invalid communication method specified in environment file');
        }
    } catch (error) {
        debugLog('Error finding dispenser port:', error);
        throw error;
    }
}
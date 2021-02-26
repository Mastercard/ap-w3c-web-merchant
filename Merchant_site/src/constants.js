/**  Copyright (c) 2021 Mastercard
 
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 
*/
export const aptrId = '123456789ABCDEFGHI';
export const ERROR_MESSAGES = {
    M5002: { message: "Failed to update data", code: "M5002" },
    M5003: { message: "Invalid payment response", code: "M5003" },
    M5004: { message: "Payment response decryption failed", code: "M5004" },
    M5005: { message: "Payment response sign verification failed", code: "M5005" },
    M5006: { message: "Failed to complete operation", code: "M5006" },
    M5007: { message: "Failed to fetch data", code: "M5007" },
    M5008: { message: "Response decode failed", code: "M5008" }
}
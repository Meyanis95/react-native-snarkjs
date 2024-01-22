/*
    Copyright 2018 0KIMS association.

    This file is part of snarkJS.

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

import * as fastFile from "fastfile";
import { WitnessCalculatorBuilder } from "react-native-circom_runtime";
import * as wtnsUtils from "./wtns_utils.js";
import * as binFileUtils from "react-native-binfileutils";

export default async function wtnsCalculate(
  input,
  wasmFileName,
  wtnsFileName,
  options
) {
  console.log("wtnsCalculate");

  const wasmFileBuff = await get(wasmFileName)
    .then(function (res) {
      return res;
    })
    .then(function (ab) {
      return new Uint8Array(ab);
    })
    .catch((err) => {
      console.log("err wtnsCalculate");
      console.log(err);
    });
  const o = {
    type: "mem",
    data: wasmFileBuff,
  };
  const fdWasm = await fastFile.readExisting(o);
  const wasm = await fdWasm.read(fdWasm.totalSize);

  console.log("WitnessCalculatorBuilder start");
  const wc = await WitnessCalculatorBuilder(wasm);

  const w = await wc.calculateBinWitness(input);

  const fdWtns = await binFileUtils.createBinFile(wtnsFileName, "wtns", 2, 2);

  await wtnsUtils.writeBin(fdWtns, w, wc.prime);
  await fdWtns.close();
}

export function readExisting(o) {
  const fd = new MemFile();
  fd.o = o;
  fd.allocSize = o.data.byteLength;
  fd.totalSize = o.data.byteLength;
  fd.readOnly = true;
  fd.pos = 0;
  return fd;
}

export function get(url) {
  return new Promise((accept, reject) => {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "arraybuffer";

    req.onload = function (event) {
      var resp = req.response;
      if (resp) {
        accept(resp);
      }
    };

    req.send(null);
  });
}

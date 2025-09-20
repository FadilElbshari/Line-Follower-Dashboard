let port;
const powerBtn = document.querySelector('.power-btn');
const forwardBtn = document.querySelector('.forward-btn');
const backwardBtn = document.querySelector('.reverse-btn');
const speedControl1 = document.getElementById("speed1");
const speedControl2 = document.getElementById("speed2");
const sendSpeed = document.getElementById("sendSpeed");
const leftSensor = document.getElementById('left-value');
const middleSensor = document.getElementById('center-value');
const rightSensor = document.getElementById('right-value');

const sensors = [leftSensor, middleSensor, rightSensor];

let status = false;

const data = document.getElementById("dataToSend");



document.getElementById('connect-button').addEventListener('click', async () => {
    try {
        port = await navigator.serial.requestPort();
        console.log('User granted access to port:', port);

        await port.open({ baudRate: 9600 });
        console.log('Port opened successfully.');

        readFromPort(port);
    } catch (error) {
        console.error('Error:', error);
    }
});



async function writeToPort(port, data) {
    const writer = port.writable.getWriter();

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    await writer.write(encodedData);
    console.log('Data written to port:', data);

    writer.releaseLock();
}

async function readFromPort(port) {
    const reader = port.readable.getReader();
    let buffer = "";
    let count =0;

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                console.log('Reader closed.');
                break;
            }

            const text = new TextDecoder().decode(value);
            buffer+=text;

            while (buffer.length >= 4) {
                count = count==3 ? 0 : count;
                let value = buffer.slice(0, 4);
                sensors[count].textContent=value;
                buffer = buffer.slice(4);
                count++;
            
            }
            // console.log('Data received:', count);


        }
    } catch (error) {
        console.error('Error reading from port:', error);
    } finally {
        reader.releaseLock();
    }
}



powerBtn.addEventListener("click", () => {

    powerBtn.classList.toggle("active");

    console.log(!status ? "ON" : "OFF")
    if (status) {
        turnOff();
    } else {
        turnOn();
    }
    status = !status;
})

sendSpeed.addEventListener("click", async () => {
    let speed1 = speedControl1.value;
    let speed2 = speedControl2.value;

    if (speed1>=0 && speed1<256 && speed2 >=0 && speed2 <256) {
        console.log(speed1, speed2);
        if (!port) {
            console.error('Port not connected.');
            return;
        }
    
        try {
            await writeToPort(port, `A${String(speed1)}B${String(speed2)}`);
        } catch (error) {
            console.error('Error writing to port:', error);
        }
    }else {
        console.error("speed out of range");
    }

    

})

forwardBtn.addEventListener("click", async () => {
    if (!port) {
        console.error('Port not connected.');
        return;
    }

    try {
        await writeToPort(port, 'W');
    } catch (error) {
        console.error('Error writing to port:', error);
    }

})
backwardBtn.addEventListener("click", async () => {
    if (!port) {
        console.error('Port not connected.');
        return;
    }

    try {
        await writeToPort(port, 'S');
    } catch (error) {
        console.error('Error writing to port:', error);
    }

})


const turnOn = async () => {
    if (!port) {
        console.error('Port not connected.');
        return;
    }

    try {
        await writeToPort(port, 'N');
    } catch (error) {
        console.error('Error writing to port:', error);
    }

}

const turnOff = async () => {
    if (!port) {
        console.error('Port not connected.');
        return;
    }

    try {
        await writeToPort(port, 'F');
    } catch (error) {
        console.error('Error writing to port:', error);
    }
}

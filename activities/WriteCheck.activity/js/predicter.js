{
  //  

    const canvas = document.getElementById('paint-canvas');
    const butt=document.getElementById('Check');
    const context = canvas.getContext('2d');
    // const clearCanvas = document.getElementById('clear-canvas');
    // const predictedLetter = document.getElementById('predicted-letter');
    // const top3Letter = document.getElementById('top3-letter');

    const msg1 = 'Draw an uppercase letter';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function setListeners(model) {
        butt.addEventListener('click', () => predict(model));
        // canvas.addEventListener('mouseleave', () => predict(model));
    }

    // function resetText() {
    //     predictedLetter.innerText = msg1;
    //     top3Letter.innerText = '';
    // }

    // function generateTop3String(scores) {
    //     let finalString = '';
    //     for (let score of scores) {
    //         finalString += `<span>${score.letter}</span>: ${(score.value * 100).toFixed(3)}% `;
    //     }
    //     return finalString.trim();
    // }

    function predict(model) {
        let canvasPixels = context.getImageData(0, 0, canvas.width, canvas.height);
        let canvasPixelsTensor = tf.fromPixels(canvasPixels, 1);
        canvasPixelsTensor = tf.image.resizeBilinear(canvasPixelsTensor, [28, 28]);
        canvasPixelsTensor = canvasPixelsTensor.toFloat().mul(tf.tensor1d([1 / 255])).expandDims(0);

        let results = model.predict(canvasPixelsTensor);

        results.data().then(data => {
            data = Array.from(data);

            let letterScores = data.map((elem, i) => {
                return { letter: letters[i], value: elem };
            });
            letterScores.sort((a, b) => b.value - a.value);
            let top3 = letterScores.slice(0, 3);

            window.alert(top3[0].letter);
            console.log(top3);
        });
    }

    tf.loadModel('model/model.json').then(setListeners);
}
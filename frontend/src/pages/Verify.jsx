import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, RotateCw, UserX } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MODEL_URL = '/models';

const faceDetectionOptions = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5
});

const CAPTURE_WIDTH = 480;  // Standard mobile-like width
const CAPTURE_HEIGHT = 640; // Portrait orientation (taller than wide)

export default function GovDocSelfieUploader() {
  const navigate = useNavigate();
  const [step, setStep] = useState('document');
  const [docFile, setDocFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [docPreview, setDocPreview] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selfieError, setSelfieError] = useState('');
  const [isCheckingFace, setIsCheckingFace] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelError, setModelError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      console.log("Loading face-api models...");
      setModelError('');
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log("Face API models loaded successfully.");
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading face-api models:", error);
        setModelError("Could not load face detection models. Please ensure model files are in the '/models' directory and refresh.");
        setModelsLoaded(false);
      }
    };
    loadModels();

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (step === 'selfie' && !selfiePreview) {
      setupCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [step, selfiePreview]);

  const setupCamera = async () => {
    console.log("Setting up camera...");
    setIsCameraReady(false);
    setSelfieError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: CAPTURE_WIDTH },
          height: { ideal: CAPTURE_HEIGHT }
        }
      });
      streamRef.current = stream; 
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("Camera stream ready.");
          setIsCameraReady(true); 
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setSelfieError("Camera access denied. Please grant permission in your browser settings.");
      } else {
        setSelfieError("Could not access camera. Please ensure it's connected and not in use by another application.");
      }
      setIsCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      console.log("Stopping camera stream.");
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraReady(false);
    }
  };

  const captureImageToCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && isCameraReady) {
      // Create a fixed-size canvas with mobile-like dimensions
      canvas.width = CAPTURE_WIDTH;
      canvas.height = CAPTURE_HEIGHT;
      
      const context = canvas.getContext('2d');
      
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling to maintain aspect ratio
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
      
      if (videoAspect > canvasAspect) {
        // Video is wider than canvas
        drawHeight = canvas.height;
        drawWidth = video.videoWidth * (canvas.height / video.videoHeight);
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        // Video is taller than canvas
        drawWidth = canvas.width;
        drawHeight = video.videoHeight * (canvas.width / video.videoWidth);
        offsetY = (canvas.height - drawHeight) / 2;
      }
      
      // Mirror effect (selfie mode)
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      
      // Draw the video frame to the canvas, centered
      context.drawImage(
        video, 
        canvas.width - drawWidth - offsetX, // Adjust for mirroring
        offsetY, 
        drawWidth, 
        drawHeight
      );
      
      // Reset transformation
      context.setTransform(1, 0, 0, 1, 0, 0);

      return canvas;
    } else {
      console.error("Cannot capture: Video or canvas not ready.");
      setSelfieError("Camera is not ready. Please wait a moment and try again.");
      return null;
    }
  };

  const detectFaceInImage = async (canvas) => {
    return true;

  };

  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    console.log(e.target.files);

    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        alert("File is too large. Please upload an image under 5MB.");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("Invalid file type. Please upload an image (PNG, JPG, GIF).");
        return;
      }

      setDocFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualCapture = async () => {
    const canvas = captureImageToCanvas();
    if (!canvas) return;

    const faceFound = await detectFaceInImage(canvas);

    if (faceFound) {
      canvas.toBlob((blob) => {
        if (blob) {
          setSelfieFile(blob); 
          setSelfiePreview(canvas.toDataURL('image/jpeg', 0.9)); 
          setSelfieError(''); 
        } else {
          setSelfieError("Failed to process the captured image. Please try again.");
          setSelfieFile(null);
          setSelfiePreview('');
        }
      }, 'image/jpeg', 0.9);
    } else {
      setSelfieFile(null);
      setSelfiePreview('');
    }
  };

  const retakeSelfie = () => {
    setSelfieError('');
    setSelfieFile(null);
    setSelfiePreview('');
    setIsCheckingFace(false);
  };

  const handleSubmit = async () => {
    if (!docFile || !selfieFile) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('documentImage', docFile, 'document.jpg'); 
    formData.append('selfieImage', selfieFile, 'selfie.jpg');

    try {
      console.log("Submitting verification data...");
      const userId = localStorage.getItem('id');
      console.log(import.meta.env.VITE_BASE_URL);
      console.log(userId);
      
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users/verifyKyc`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'id': userId,
            "ngrok-skip-browser-warning": true  
          },
        }
      );

      // if(res.status == 500)

      console.log("Submission successful:", res.data);
      setUploadStatus('success');
      setStep('confirmation'); 

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      setStep('confirmation'); 
    } finally {
      setIsUploading(false); 
    }
  };

  const goBackToDocument = () => {
    setStep('document');
    setSelfieFile(null);
    setSelfiePreview('');
    setSelfieError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
          <h1 className="text-2xl font-bold text-center tracking-tight">Identity Verification</h1>
        </div>

        <div className="flex justify-center p-4 border-b border-gray-200">
          <div className={`flex items-center ${step === 'document' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-bold ${step === 'document' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
            <span className={`font-medium ${step === 'document' ? '':'text-sm'}`}>Document</span>
          </div>
          <div className="flex-1 border-t-2 border-gray-300 mx-4 self-center"></div>
          <div className={`flex items-center ${step === 'selfie' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-bold ${step === 'selfie' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
            <span className={`font-medium ${step === 'selfie' ? '':'text-sm'}`}>Selfie</span>
          </div>
          <div className="flex-1 border-t-2 border-gray-300 mx-4 self-center"></div>
          <div className={`flex items-center ${step === 'confirmation' ? (uploadStatus === 'success' ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'confirmation' ? (uploadStatus === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : 'bg-gray-300 text-gray-600'}`}>
              {step === 'confirmation' ? (uploadStatus === 'success' ? <CheckCircle size={14}/> : <AlertCircle size={14}/>) : <CheckCircle size={14}/>}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {step === 'document' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">1. Upload Government ID</h2>
              <p className="text-gray-600 text-sm">Upload a clear, unobstructed photo of your valid government-issued ID (e.g., Driver's License, Passport).</p>

              {!docPreview ? (
                <label
                  htmlFor="docInput"
                  className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <span className="block text-sm font-medium text-gray-700">Click to upload document</span>
                  <span className="block text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                  <input
                    id="docInput"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/gif"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleDocUpload}
                  />
                </label>
              ) : (
                <div className="relative group">
                  <p className="text-sm font-medium text-gray-700 mb-2">Document Preview:</p>
                  <img
                    src={docPreview}
                    alt="Document preview"
                    className="w-full h-auto max-h-60 object-contain rounded-lg border border-gray-300"
                  />
                  <button
                    title="Upload different document"
                    className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    onClick={() => {
                      setDocFile(null);
                      setDocPreview('');
                      const input = document.getElementById('docInput');
                      if (input) input.value = '';
                    }}
                  >
                    <RotateCw className="h-5 w-5 text-gray-700 hover:text-blue-600" />
                  </button>
                </div>
              )}

              <button
                className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors duration-200 flex items-center justify-center ${
                  docFile
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                disabled={!docFile}
                onClick={() => setStep('selfie')}
              >
                Continue to Selfie Capture
              </button>
            </div>
          )}

          {step === 'selfie' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">2. Take a Selfie</h2>

              {modelError && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{modelError}</span>
                </div>
              )}
              {!modelsLoaded && !modelError && (
                <div className="flex items-center justify-center p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md text-sm">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading face detection models...
                </div>
              )}

              {!selfiePreview && modelsLoaded && (
                <p className="text-gray-600 text-sm">Position your face in the center. When ready, click "Capture Selfie". Your photo will be taken in portrait mode (like on a mobile device).</p>
              )}

              <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden border border-gray-300">
                {!selfiePreview ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover scale-x-[-1]"
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Portrait mode guide overlay */}
                      <div className="border-2 border-dashed border-white opacity-50 rounded-full w-1/2 h-1/3"></div>
                    </div>
                    {!isCameraReady && !selfieError && modelsLoaded && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white text-sm">
                        Initializing Camera...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="relative group w-full h-full">
                    <img
                      src={selfiePreview}
                      alt="Selfie preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      title="Retake Selfie"
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 disabled:opacity-50"
                      onClick={retakeSelfie}
                      disabled={isCheckingFace || isUploading}
                    >
                      <RotateCw className="h-5 w-5 text-gray-700 hover:text-blue-600" />
                    </button>
                  </div>
                )}
              </div>

              {selfieError && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm transition-all duration-300">
                  <UserX className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{selfieError}</span>
                </div>
              )}
              {isCheckingFace && (
                <div className="flex items-center justify-center text-sm text-gray-600 py-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking for clear face...
                </div>
              )}

              {!selfiePreview ? (
                <button
                  onClick={handleManualCapture}
                  className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors duration-200 flex items-center justify-center gap-2 ${
                    !isCameraReady || isCheckingFace || !modelsLoaded || !!modelError
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                  disabled={!isCameraReady || isCheckingFace || !modelsLoaded || !!modelError}
                >
                  <Camera className="h-5 w-5" />
                  {isCheckingFace ? 'Checking...' : 'Capture Selfie'}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={retakeSelfie}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={isUploading || isCheckingFace}
                  >
                    Retake Selfie
                  </button>
                  <button
                    onClick={handleSubmit}
                    className={`flex-1 py-3 px-4 rounded-md font-semibold text-white transition-colors ${
                      selfieFile ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    disabled={!selfieFile || isUploading || isCheckingFace}
                  >
                    Confirm & Continue
                  </button>
                </div>
              )}

              <div className="mt-4">
                <button
                  className="w-full py-3 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  onClick={goBackToDocument}
                  disabled={isUploading || isCheckingFace}
                >
                  Back to Document
                </button>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-6 text-center">
              {uploadStatus === 'success' ? (
                <>
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto animate-pulse" />
                  <h2 className="text-xl font-semibold text-gray-800">Verification Submitted!</h2>
                  <p className="text-gray-600">Your identity documents have been submitted successfully. We will review them shortly and notify you of the outcome.</p>
                  <button
                    className="w-full max-w-xs mx-auto py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      navigate('/dashboard');
                    }}
                  >
                    Continue to dashboard
                  </button>
                </>
              ) : (
                <>
                  <AlertCircle className="h-20 w-20 text-red-500 mx-auto" />
                  <h2 className="text-xl font-semibold text-gray-800">Submission Failed</h2>
                  <p className="text-gray-600">Unfortunately, there was an error submitting your verification. Please check your connection and try again.</p>
                  <button
                    className="w-full max-w-xs mx-auto py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => {
                      setUploadStatus(null); 
                      setStep('selfie'); 
                    }}
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </div> 
      </div> 
    </div>
  );
}
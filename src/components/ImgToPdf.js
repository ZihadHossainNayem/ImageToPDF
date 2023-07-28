import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import Dropzone from "react-dropzone";
import { PiUploadSimpleLight, PiTrashLight } from "react-icons/pi";
import { AiOutlineZoomIn } from "react-icons/ai";

export const ImgToPdf = () => {
  const [images, setImages] = useState([]);
  const [margin, setMargin] = useState("no-margin");
  const [loading, setLoading] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff"); // Default background color is white

  const handleImageDrop = (acceptedFiles) => {
    const updatedImages = images.concat(acceptedFiles);
    setImages(updatedImages);
  };
  const handleConvertToPdf = async (container) => {
    setLoading(true);

    const pdf = new jsPDF({
      unit: "px",
      format: "a4",
    });

    let marginLeft = 0;
    let marginTop = 0;

    if (margin === "low-margin") {
      marginLeft = 10;
      marginTop = 10;
    } else if (margin === "medium-margin") {
      marginLeft = 30;
      marginTop = 30;
    } else if (margin === "big-margin") {
      marginLeft = 70;
      marginTop = 70;
    }

    for (const image of images) {
      const img = new Image();
      img.src = URL.createObjectURL(image);

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      container.innerHTML = ""; // Clear previous content
      container.appendChild(img);

      const maxWidth = pdf.internal.pageSize.getWidth() - marginLeft * 2;
      const maxHeight = pdf.internal.pageSize.getHeight() - marginTop * 2;

      let targetWidth = img.width;
      let targetHeight = img.height;

      // Resize the image if it exceeds the PDF page dimensions
      if (targetWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = (img.height * targetWidth) / img.width;
      }

      if (targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = (img.width * targetHeight) / img.height;
      }

      // Calculate horizontal and vertical offsets to apply margins
      const offsetX = marginLeft + (maxWidth - targetWidth) / 2;
      const offsetY = marginTop + (maxHeight - targetHeight) / 2;

      // Add the background color to the PDF
      pdf.setFillColor(backgroundColor);
      pdf.rect(
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight(),
        "F"
      );

      // Add the resized image to the PDF with the calculated offsets
      pdf.addImage(
        img,
        "JPEG",
        offsetX,
        offsetY,
        targetWidth,
        targetHeight,
        undefined,
        "FAST"
      );

      pdf.addPage();
    }

    pdf.deletePage(pdf.internal.getNumberOfPages());
    pdf.save("converted.pdf");

    setLoading(false);
  };

  /* handling delete images from upload */
  const handleDeleteImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  /* handling image zooming */
  const handleZoomImage = (index) => {
    //progress
  };

  const containerRef = useRef(null);

  return (
    <div className="container mx-auto my-12">
      <div className="mx-4">
        <div>
          <h1 className="text-center text-3xl font-semibold mb-8">
            Image to PDF{" "}
          </h1>
        </div>

        <div className="flex gap-10 items-center mb-8">
          <label>
            Margin:
            <select onChange={(e) => setMargin(e.target.value)}>
              <option value="no-margin">No Margin</option>
              <option value="low-margin">Low Margin</option>
              <option value="medium-margin">Low Margin</option>
              <option value="big-margin">Big Margin</option>
            </select>
          </label>

          {/* Background color selection */}
          <label className="flex items-center gap-2">
            Background Color:
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </label>
          <button onClick={() => handleConvertToPdf(containerRef.current)}>
            {loading ? "Generating PDF..." : "Convert to PDF"}
          </button>
        </div>
        <div className="bg-gray-100">
          <Dropzone onDrop={handleImageDrop}>
            {({ getRootProps, getInputProps }) => (
              <div
                {...getRootProps()}
                className="bg-gray-100 p-20 h-300 flex flex-col justify-center items-center"
                style={{
                  border: "1px dashed #363636 ",
                  borderStyle: "dashed",
                  borderWidth: "2px",
                }}
              >
                <input {...getInputProps()} />
                <div className="flex items-center justify-center flex-col gap-4">
                  <PiUploadSimpleLight className="text-5xl" />
                  <p className="text-center">
                    Drag and drop images here, or click to select files from
                    device
                  </p>
                </div>
              </div>
            )}
          </Dropzone>
        </div>

        <div ref={containerRef} style={{ display: "none" }}></div>

        <div className="flex flex-wrap justify-start items-center mt-8">
          {images.map((image, index) => (
            <div key={index} className="relative mr-2 mb-2">
              <img
                src={URL.createObjectURL(image)}
                alt={`Category ${index + 1}`}
                className="w-[150px]"
              />
              <div className="absolute top-1 left-1 flex flex-col items-center justify-center">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleZoomImage(index)}
                    className="bg-red-500 text-white rounded-full p-2"
                  >
                    <AiOutlineZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteImage(index)}
                    className="bg-red-500 text-white rounded-full p-2"
                  >
                    <PiTrashLight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

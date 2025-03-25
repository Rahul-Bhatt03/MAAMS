import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchResearchById,
  updateResearch,
  deleteResearch,
  addAttachment,
  removeAttachment,
  resetResearchState,
} from "../../../features/researchSlice";
import { uploadFile, resetUploadState } from "../../../features/uploadSlice";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
  Form,
  ListGroup,
} from "react-bootstrap";
import { format } from "date-fns";
import {
  FaTrash,
  FaEdit,
  FaDownload,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaShareAlt,
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ResearchDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pdfRef = useRef(null);

  const { currentResearch, loading, error, success } = useSelector(
    (state) => state.research
  );
  const uploadState = useSelector((state) => state.upload);

  const [userRole, setUserRole] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    dispatch(fetchResearchById(id));

    // Get user role from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserRole(parsedUser.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    return () => {
      dispatch(resetResearchState());
      dispatch(resetUploadState());
    };
  }, [id, dispatch]);

  const hasAdminAccess = () => {
    return ["admin", "superadmin", "groupadmin"].includes(
      userRole.toLowerCase()
    );
  };

  const handleDelete = () => {
    dispatch(deleteResearch(id))
      .unwrap()
      .then(() => {
        navigate("/research");
      })
      .catch((error) => {
        console.error("Failed to delete research:", error);
      });
    setShowDeleteModal(false);
  };

  const handleAttachmentSubmit = async (e) => {
    e.preventDefault();

    if (!attachmentFile || !attachmentName) {
      return;
    }

    // Create a reference to the file to use later
    const currentFile = attachmentFile;
    const currentName = attachmentName;

    // First upload the file
    try {
      await dispatch(uploadFile(currentFile)).unwrap();

      // If successful, the useEffect will handle the attachment
      // But we could also handle it here directly
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  // Watch for successful file upload and then add the attachment
  useEffect(() => {
    if (uploadState.success && uploadState.url && attachmentFile) {
      const fileType = attachmentFile.type.split("/")[1];
      const attachmentData = {
        name: attachmentName,
        url: uploadState.url,
        type: fileType,
      };

      dispatch(addAttachment({ id, attachmentData }))
        .unwrap()
        .then(() => {
          setShowAttachmentModal(false);
          setAttachmentName("");
          setAttachmentFile(null);
          dispatch(resetUploadState());
        })
        .catch((error) => {
          console.error("Failed to add attachment:", error);
        });
    }
  }, [
    uploadState.success,
    uploadState.url,
    dispatch,
    id,
    attachmentFile,
    attachmentName,
  ]);

  // Watch for successful file upload and then add the attachment
  useEffect(() => {
    if (uploadState.success && uploadState.url) {
      const fileType = attachmentFile.type.split("/")[1];
      const attachmentData = {
        name: attachmentName,
        url: uploadState.url,
        type: fileType,
      };

      dispatch(addAttachment({ id, attachmentData }))
        .unwrap()
        .then(() => {
          setShowAttachmentModal(false);
          setAttachmentName("");
          setAttachmentFile(null);
          dispatch(resetUploadState());
        })
        .catch((error) => {
          console.error("Failed to add attachment:", error);
        });
    }
  }, [
    uploadState.success,
    uploadState.url,
    dispatch,
    id,
    attachmentFile,
    attachmentName,
  ]);

  const handleRemoveAttachment = (attachmentId) => {
    dispatch(removeAttachment({ id, attachmentId }))
      .unwrap()
      .catch((error) => {
        console.error("Failed to remove attachment:", error);
      });
  };

  const handleShareResearch = () => {
    // Here you would implement the logic to share via email
    // For now, just close the modal
    setShowShareModal(false);
    setEmailAddress("");
    // You would typically call an API endpoint here to send the email
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    setPdfGenerating(true);

    try {
      const content = pdfRef.current;
      const canvas = await html2canvas(content, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        0,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save(`${currentResearch.title.replace(/\s+/g, "_")}_research.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setPdfGenerating(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFileAlt />;

    fileType = fileType.toLowerCase();

    if (fileType.includes("pdf")) return <FaFilePdf />;
    if (
      fileType.includes("image") ||
      ["jpg", "jpeg", "png", "gif"].includes(fileType)
    )
      return <FaFileImage />;
    if (fileType.includes("word") || fileType === "doc" || fileType === "docx")
      return <FaFileWord />;
    if (fileType.includes("excel") || fileType === "xls" || fileType === "xlsx")
      return <FaFileExcel />;

    return <FaFileAlt />;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        Error: {error}
      </Alert>
    );
  }

  if (!currentResearch) {
    return <Alert variant="warning">Research project not found.</Alert>;
  }

  return (
    <Container className="py-4">
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Research Detail</h1>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => setShowShareModal(true)}
          >
            <FaShareAlt className="me-2" /> Share
          </Button>
          <Button
            variant="primary"
            onClick={generatePDF}
            disabled={pdfGenerating}
          >
            {pdfGenerating ? (
              <Spinner size="sm" animation="border" className="me-2" />
            ) : (
              <FaFilePdf className="me-2" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      <div ref={pdfRef}>
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
            <h2 className="mb-0">{currentResearch.title}</h2>
            <Badge
              bg={
                currentResearch.status === "Ongoing"
                  ? "primary"
                  : currentResearch.status === "Completed"
                  ? "success"
                  : currentResearch.status === "Pending"
                  ? "warning"
                  : "danger"
              }
              text={currentResearch.status === "Pending" ? "dark" : "white"}
            >
              {currentResearch.status}
            </Badge>
          </Card.Header>

          <Card.Body>
            <Row className="mb-4">
              <Col md={6}>
                <p className="mb-1 text-muted">Principal Investigator</p>
                <p className="fw-bold">
                  {currentResearch.principal_investigator_id?.name || "N/A"}
                </p>
                {currentResearch.principal_investigator_id?.specialization && (
                  <p className="small text-muted">
                    {currentResearch.principal_investigator_id.specialization}
                  </p>
                )}
              </Col>

              <Col md={6}>
                <p className="mb-1 text-muted">Department</p>
                <p className="fw-bold">
                  {currentResearch.department_id?.name || "N/A"}
                </p>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <p className="mb-1 text-muted">Timeline</p>
                <p>
                  <span className="fw-bold">
                    {format(
                      new Date(currentResearch.start_date),
                      "MMMM d, yyyy"
                    )}
                  </span>
                  {currentResearch.end_date && (
                    <>
                      <span> to </span>
                      <span className="fw-bold">
                        {format(
                          new Date(currentResearch.end_date),
                          "MMMM d, yyyy"
                        )}
                      </span>
                    </>
                  )}
                </p>
              </Col>

              <Col md={6}>
                <p className="mb-1 text-muted">Funding Source</p>
                <p className="fw-bold">
                  {currentResearch.funding_source || "Not specified"}
                </p>
              </Col>
            </Row>

            <hr className="my-4" />

            <h5>Description</h5>
            <p className="white-space-pre-line">
              {currentResearch.description}
            </p>

            {currentResearch.keywords &&
              currentResearch.keywords.length > 0 && (
                <div className="mt-4">
                  <h5>Keywords</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {currentResearch.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        bg="light"
                        text="dark"
                        className="px-3 py-2"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {currentResearch.abstract && (
              <div className="mt-4">
                <h5>Abstract</h5>
                <p className="white-space-pre-line">
                  {currentResearch.abstract}
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Attachments</h5>
          {hasAdminAccess() && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowAttachmentModal(true)}
            >
              Add Attachment
            </Button>
          )}
        </Card.Header>

        <Card.Body>
          {currentResearch.attachments &&
          currentResearch.attachments.length > 0 ? (
            <ListGroup>
              {currentResearch.attachments.map((attachment) => (
                <ListGroup.Item
                  key={attachment._id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center">
                    <div className="me-3 fs-4">
                      {getFileIcon(attachment.type)}
                    </div>
                    <div>
                      <p className="mb-0 fw-medium">{attachment.name}</p>
                      <small className="text-muted">
                        {attachment.uploaded_at &&
                          format(
                            new Date(attachment.uploaded_at),
                            "MMM d, yyyy"
                          )}
                      </small>
                    </div>
                  </div>

                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      as="a"
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaDownload />
                    </Button>

                    {hasAdminAccess() && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveAttachment(attachment._id)}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-muted">No attachments available.</p>
          )}
        </Card.Body>
      </Card>

      {hasAdminAccess() && (
        <div className="d-flex gap-2 justify-content-end">
          <Button
            variant="outline-primary"
            onClick={() => navigate(`/research/edit/${id}`)}
          >
            <FaEdit className="me-2" /> Edit
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <FaTrash className="me-2" /> Delete
          </Button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this research project? This action
          cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Attachment Modal */}
      <Modal
        show={showAttachmentModal}
        onHide={() => setShowAttachmentModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Attachment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAttachmentSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Attachment Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter attachment name"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>File</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setAttachmentFile(e.target.files[0])}
                required
              />
              <Form.Text className="text-muted">
                Supported formats: PDF, Word, Excel, Images, etc.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowAttachmentModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={uploadState.loading}
              >
                {uploadState.loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Uploading...
                  </>
                ) : (
                  "Add Attachment"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share Research</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleShareResearch();
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Enter the email address of the person you want to share this
                research with.
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowShareModal(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Share
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ResearchDetail;

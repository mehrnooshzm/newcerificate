import CertificateItem from './CertificateItem';

const CertificatesList = ({ certificates, onDelete }) => {
  // Render a list of CertificateItem components
  return certificates.map((certificate) => (
    <CertificateItem
      key={certificate.id} // Unique key for React rendering
      certificate={certificate} // Pass individual certificate data
      onDelete={onDelete} // Pass delete callback to each item
    />
  ));
};

export default CertificatesList;

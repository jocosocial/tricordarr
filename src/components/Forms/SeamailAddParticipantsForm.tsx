const initialValues = {
  users: [],
};

export const SeamailAddParticipantsForm = () => {
  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
    </Formik>
  );
};

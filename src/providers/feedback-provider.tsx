import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Snackbar, Text } from 'react-native-paper';

type NoticeTone = 'success' | 'error' | 'info';

type NoticeOptions = {
  title?: string;
  message: string;
  tone?: NoticeTone;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type FeedbackContextValue = {
  showNotice: (options: NoticeOptions) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: PropsWithChildren) {
  const [notice, setNotice] = useState<Required<NoticeOptions> | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const value = useMemo<FeedbackContextValue>(
    () => ({
      showNotice: ({ title = '', message, tone = 'info' }) => {
        setNotice({ title, message, tone });
      },
      confirm: async (options) =>
        new Promise<boolean>((resolve) => {
          setPendingConfirm({
            confirmLabel: 'Confirm',
            cancelLabel: 'Cancel',
            destructive: false,
            ...options,
            resolve,
          });
        }),
    }),
    [],
  );

  const closeConfirm = (result: boolean) => {
    pendingConfirm?.resolve(result);
    setPendingConfirm(null);
  };

  const accentColor =
    notice?.tone === 'success' ? '#16a34a' : notice?.tone === 'error' ? '#dc2626' : '#2563eb';

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Portal>
        <Dialog
          visible={Boolean(pendingConfirm)}
          onDismiss={() => closeConfirm(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>{pendingConfirm?.title}</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogMessage}>{pendingConfirm?.message}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => closeConfirm(false)} textColor="#9fb2c9">
              {pendingConfirm?.cancelLabel ?? 'Cancel'}
            </Button>
            <Button
              onPress={() => closeConfirm(true)}
              buttonColor={pendingConfirm?.destructive ? '#7f1d1d' : '#123a64'}
              textColor="#f8fbff"
            >
              {pendingConfirm?.confirmLabel ?? 'Confirm'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={Boolean(notice)}
        onDismiss={() => setNotice(null)}
        duration={3600}
        style={[styles.snackbar, { borderColor: accentColor }]}
      >
        <View>
          {notice?.title ? <Text style={styles.snackbarTitle}>{notice.title}</Text> : null}
          <Text style={styles.snackbarMessage}>{notice?.message}</Text>
        </View>
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 24,
    backgroundColor: '#0d1b2a',
    borderWidth: 1,
    borderColor: '#27415d',
  },
  dialogTitle: {
    color: '#f7fbff',
  },
  dialogMessage: {
    color: '#a9bbcf',
    lineHeight: 22,
  },
  snackbar: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    backgroundColor: '#0f1c2b',
  },
  snackbarTitle: {
    color: '#f7fbff',
    fontWeight: '700',
    marginBottom: 2,
  },
  snackbarMessage: {
    color: '#cad7e4',
  },
});

from numpy import genfromtxt
import numpy as np
from sklearn import preprocessing
from sklearn import feature_selection
from sklearn import ensemble

class FeatureFiltering:
    def __init__(self, app, filepath):
        self.app = app
        headers, X, y = self.read_file(filepath)
        self.headers = headers
        self.X = X
        self.y = y

    def read_file(self, filepath):
        data = genfromtxt(filepath, delimiter=',', dtype=None)
        headers = data[0]
        data = data[1:,:]
        X = data[:,:-1]
        X = [[float(y) for y in X] for X in X]
        y = data[:,-1]
        return headers, X, y

    def run(self, algorithm_type, threshold):
        X = self.normalize(self.X)
        self.app.logger.debug("Filtering Method: "+str(algorithm_type))
        if algorithm_type == "chi2":
            indeces = self.chi2(X, self.y, threshold)
        elif algorithm_type == "variance_threshold":
            indeces = self.variance_threshold(X, threshold)
        elif algorithm_type == "random_forest_classifier":
            indeces = self.random_forest_classifier(X, self.y, threshold)
        else:
            return []
        if len(indeces) == 0:
            return []
        mask = self.indeces_to_mask(indeces, X)
        self.app.logger.debug("Mask: "+str(mask))
        return mask

    def normalize(self, X):
        min_max_scaler = preprocessing.MinMaxScaler(copy=False) # normalize data between 0 and 1
        X = min_max_scaler.fit_transform(X)
        return X

    def chi2(self, X, y, threshold = 15.0):
        """
        The chi-square test measures dependence between stochastic variables, so using this function "weeds out" the features that 
        are the most likely to be independent of class and therefore irrelevant for classification.
        """
        chi2, _ = feature_selection.chi2(X, y)
        indeces = []
        for i, c in enumerate(chi2):
            if c > threshold:
                indeces.append(i)
        return indeces

    def variance_threshold(self, X, threshold = 0.005):
        """
        This feature selection algorithm looks only at the features (X), not the desired outputs (y), and can thus be used for unsupervised learning.
        The default is to keep all features with non-zero variance, i.e. remove the features that have the same value in all samples.
        """
        selector = feature_selection.VarianceThreshold(threshold = threshold)
        try:
            X = selector.fit_transform(X)
        except ValueError as e:
            return []
        indeces = selector.get_support(indices = True)
        return indeces

    def random_forest_classifier(self, X, y, threshold = 0.1):
        """
        Use the RandomForestClassifier to score the features by their importance
        """
        clf = ensemble.RandomForestClassifier()
        clf.fit(X, y)
        features_importance = clf.feature_importances_
        indeces = []
        for i, f in enumerate(features_importance):
            if f > threshold:
                indeces.append(i)
        return indeces

    def indeces_to_mask(self, indeces, X):
        mask = []
        for i in range(len(X[0])):
            if i in indeces:
                mask.append(True)
            else:
                mask.append(False)
        return mask